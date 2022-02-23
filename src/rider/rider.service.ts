import {forwardRef, Inject, Injectable, NotFoundException, UnprocessableEntityException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {PartialRiderModelInterface, RiderModelInterface, RiderModelStructure} from "../schemas/rider.schema";
import {CreateRiderDTO, CurrentLocationDTO, PatchRiderDTO, RiderOrderAcceptanceDTO} from "./types/dto/rider.dto";
import {PharmacyService} from "../pharmacy/pharmacy.service";
import {User} from '../schemas/interfaces/user.interface';
import {FirebaseHelper} from "../helpers/firebase.helper";
import {OrderHelper} from "../order/helper/order.helper";
import {BucketService} from "../order/bucket.service";
import {ErrorUtils} from "../helpers/utils/error.utils";
import * as _ from 'lodash';
import {BucketStatusEnum, RiderBucketEnum} from "../order/types/enums/order.enum";
import {RiderBucketService} from "../order/riderBucket.service";
import {RiderBucketModelInterface} from "../schemas/riderBucket.schema";
import {PointModelStructure} from "../schemas/address.schema";
import {BucketModelInterface} from "../schemas/bucket.schema";
import {CartModelInterface} from "../schemas/cart.schema";
import {LatLngArray} from "@googlemaps/google-maps-services-js/dist";
import {GoogleMapsHelper} from "../helpers/googleMaps.helper";
import {EstimationsInterface} from "../helpers/interfaces/googleMaps.interface";
import {PharmacyModelInterface} from "../schemas/pharmacy.schema";

@Injectable()
export class RiderService {
  constructor(
    @InjectModel('Rider')
    private readonly riderModel: Model<RiderModelStructure>,
    @Inject(forwardRef(() => PharmacyService))
    private readonly pharmacyService: PharmacyService,
    private readonly firebaseHelper: FirebaseHelper,
    private readonly bucketService: BucketService,
    private readonly riderBucketService: RiderBucketService,
    @Inject(forwardRef(() => OrderHelper))
    private readonly orderHelper: OrderHelper,
    private readonly errorUtils: ErrorUtils,
    private readonly googleMapsHelper: GoogleMapsHelper,
  ) {
  }

  async sendNotificationsToRider(order: any, riderId: string) {
    try {
      await this.firebaseHelper.sendSingleNotification({data: {order: JSON.stringify(order)}, topic: riderId});
    } catch (e) {
      console.error(e);
    }
  }

  async createRider(body: CreateRiderDTO) {
    try {
      const coordinates = Array.from((body.currentLocation as string).split(','), Number).reverse();
      body.currentLocation = {type: 'Point', coordinates};
      return (await new this.riderModel(body).save()).toObject()
    } catch (e) {
      console.log(e)
    }

  }

  async getRiderById(id: string): Promise<RiderModelInterface> {
    try {
      return this.riderModel.findOne({_id: id}).lean();
    } catch (e) {
      console.log(e)
    }
  }

  async update(riderId: string, updatedRiderModel: PartialRiderModelInterface, populate: string): Promise<RiderModelInterface> {
    try {
      return this.riderModel.findOneAndUpdate(
        {_id: riderId},
        updatedRiderModel,
        {new: true});
    } catch (e) {
      console.log(e)
    }
  }

  async getNewNearRider(pharmacyId: string, excludedRiders: string[], distance: number): Promise<RiderModelInterface> {
    try {
      // todo: * get last updated time of current location to make it more responsive
      const pharmacy = await this.pharmacyService.getPharmacyById(pharmacyId)
      let rider: RiderModelInterface = await this.riderModel.findOne({
        currentLocation: {
          $near: {
            $geometry: {type: 'Point', coordinates: pharmacy.address.location.coordinates},
            $maxDistance: distance,  //todo: * add to app constants
          },
        },
        _id: {$nin: excludedRiders},
        isOnline: true
      }).lean();

      //request not sent to the rider who is already part of pending or accepted contract
      if (!_.isEmpty(rider)) {
        const alreadyRiderBucket = await this.riderBucketService.findOne({
          rider: rider['_id'].toString(),
          status: {$in: [RiderBucketEnum.ACCEPTED, RiderBucketEnum.PENDING]}
        }, {path: 'buckets'})

        // if already riderBucket exist then look for another rider
        if (!_.isEmpty(alreadyRiderBucket))
          rider = await this.getNewNearRider(pharmacyId, [...excludedRiders, rider['_id'].toString()], distance)
      }
      // if no rider found
      if (_.isEmpty(rider)) {
        // todo: * if you want to increase the distance of riders search
        if (distance < 5000)
          rider = await this.getNewNearRider(pharmacyId, excludedRiders, distance + 1000)
      }

      return rider;
    } catch (e) {
      console.error(e);
    }
  }

  async patchRider(body: PatchRiderDTO, user: User) {

    const rider = await this.getRiderById(user['_id'].toString())

    let updatedRiderModel: PartialRiderModelInterface = {}
    if ('isOnline' in body && rider['isOnline'] !== body.isOnline) {
      const {isOnline} = body
      // notify the admin according to isOnline status
      updatedRiderModel.isOnline = isOnline
    }

    if (body.currentLocation) {
      const coordinates = Array.from((body.currentLocation as string).split(','), Number).reverse();
      updatedRiderModel.currentLocation = {
        type: 'Point',
        coordinates: coordinates
      } as PointModelStructure

    }
    return this.update(user['_id'].toString(), updatedRiderModel, "")
  }

  async orderAcceptance(body: RiderOrderAcceptanceDTO, user: RiderModelInterface): Promise<RiderBucketModelInterface> {
    try {
      const {isAccepted, riderBucketId, currentLocation, reason, bucketId} = body;
      let riderBucket = await this.riderBucketService.findOne({_id: riderBucketId}, {
        path: 'buckets originBucket pharmacy',
        populate: {path: "products.product orderId userId pharmacy cart"}
      })
      if (_.isEmpty(riderBucket))
        throw new UnprocessableEntityException('Rider Bucket does not exist')

      if (riderBucket.status === RiderBucketEnum.TIME_UP)
        throw new UnprocessableEntityException('Time up for your acceptance')

      let updatedRiderBucket: RiderBucketModelInterface;
      if (isAccepted) {
        const uncompletedRiderBucket = await this.riderBucketService.findOne({
          rider: user['_id'].toString(),
          status: RiderBucketEnum.ACCEPTED
        }, {path: 'buckets'})
        if (!_.isEmpty(uncompletedRiderBucket))
          throw new UnprocessableEntityException('First Complete Previous Contract')
        updatedRiderBucket = await this.orderHelper.riderBucketAccepted(riderBucket, BucketStatusEnum.RIDER_CONFIRMED, currentLocation, user)
      }
      if (!isAccepted)
        updatedRiderBucket = await this.orderHelper.riderBucketRejected(riderBucket, RiderBucketEnum.REJECTED, reason)

      return updatedRiderBucket
    } catch (e) {
      this.errorUtils.errorHandler(e)

    }
  }

  async myPendingBuckets(user: User): Promise<RiderBucketModelInterface> {
    return await this.riderBucketService.findOne({
      rider: user['_id'].toString(),
      status: {$in: [RiderBucketEnum.PENDING]}
    }, {path: 'buckets pharmacy', populate: {path: 'userId paymentBucket cart'}})
  }

  async myBuckets(user: User): Promise<RiderBucketModelInterface> {
    return await this.riderBucketService.findOne({
      rider: user['_id'].toString(),
      status: {$in: [RiderBucketEnum.ACCEPTED, RiderBucketEnum.PICKED]}
    }, {path: 'buckets pharmacy', populate: {path: 'userId paymentBucket cart'}})
  }

  async currentContract(user: User): Promise<RiderBucketModelInterface> {
    return await this.riderBucketService.findOne({
      rider: user['_id'].toString(),
      status: {$in: [RiderBucketEnum.ACCEPTED, RiderBucketEnum.PICKED, RiderBucketEnum.PENDING]}
    }, {path: 'pharmacy buckets runningBucket', populate: {path: 'cart userId paymentBucket'}})
  }

  async currentContractTimeEstimations(body: CurrentLocationDTO, user: User): Promise<RiderBucketModelInterface> {
    const riderBucket: RiderBucketModelInterface = await this.riderBucketService.findOne({
      rider: user['_id'].toString(),
      status: {$in: [RiderBucketEnum.ACCEPTED, RiderBucketEnum.PICKED]}
    }, {path: "buckets pharmacy", populate: {path: "cart"}})

    if (_.isEmpty(riderBucket))
      throw new UnprocessableEntityException("you have not accepted any contract")
    let origin: LatLngArray;
    switch (riderBucket.status) {
      case RiderBucketEnum.PICKED:
        // get all buckets ids
        const buckets = riderBucket.buckets as BucketModelInterface[]
        // find estimations for all bucket
        const destinations: LatLngArray[] = []
        for (let bucket of buckets) {
          let cart = bucket.cart as CartModelInterface
          let latLng = cart.shipmentAddress.location.coordinates.slice() as LatLngArray
          destinations.push(latLng.reverse() as LatLngArray)
        }
        origin = body.currentLocation.split(',').map(n => parseFloat(n)) as LatLngArray
        const estimationArray: EstimationsInterface[] = await this.googleMapsHelper.singleOriginEstimationsArray(destinations, origin)
        // update estimations on each bucket
        let index = 0
        for (const bucket of buckets) {
          await this.bucketService.findOneAndUpdate({_id: bucket['_id'].toString()}, {
            patientDistance: estimationArray[index].distance,
            patientEta: estimationArray[index].duration
          }, "")
          index++
        }
        break;
      case RiderBucketEnum.ACCEPTED:
        let pharmacy = riderBucket.pharmacy as PharmacyModelInterface;
        let destination = pharmacy.address.location.coordinates.reverse().join(',');
        // calculate eta
        const {distance, eta} = await this.orderHelper.calculateETAAndDistance(destination, body.currentLocation);
        await this.riderBucketService.updateRiderBucketPopulate(
          riderBucket['_id'].toString(),
          {
            pharmacyDistance: distance,
            pharmacyEta: eta,
          },
          ""
        );
        break
    }
    return await this.riderBucketService.findOne({
      _id: riderBucket['_id'].toString()
    }, {path: "buckets"})
  }

  async rateRider(riderId: string, rate: number) {
    try {
      const rider = await this.riderModel.findById(riderId)
      if (_.isEmpty(rider))
        throw new NotFoundException('Rider Not found')
      const {rating, ratingCount} = rider
      await rider.update({rating: ((rating * ratingCount) + rate) / (ratingCount + 1), ratingCount: ratingCount + 1})
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async addRiderDeliveredBuckets(riderId: string) {
    try {
      await this.riderModel.findOneAndUpdate({_id: riderId}, {$inc: {'aggregatedProps.deliveredOrders': 1}}, {new: true})
    } catch (e) {
      throw e
    }
  }

  async addRiderRejectedBuckets(riderId: string) {
    try {
      await this.riderModel.findOneAndUpdate({_id: riderId}, {$inc: {'aggregatedProps.rejectedOrders': 1}}, {new: true})
    } catch (e) {
      throw e
    }
  }

  async addRiderForwardBuckets(riderId: string) {
    try {
      await this.riderModel.findOneAndUpdate({_id: riderId}, {$inc: {'aggregatedProps.forwardedOrders': 1}}, {new: true})
    } catch (e) {
      throw e
    }
  }

  async addRiderBucketsPayment(riderId: string, payment: number) {
    try {
      await this.riderModel.findOneAndUpdate({_id: riderId}, {$inc: {'aggregatedProps.totalRevenue': payment}}, {new: true})
    } catch (e) {
      throw e
    }
  }


}