import {forwardRef, Inject, Injectable, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {
  PartialRiderBucketModelInterface,
  RiderBucketModelInterface,
  RiderBucketModelStructure
} from "../schemas/riderBucket.schema";
import {RiderBucketPatchDTO} from "./types/dto/riderBucker.dto";
import {BucketModelInterface} from "../schemas/bucket.schema";
import {BucketStatusEnum, OrderStatusEnum, RiderBucketEnum} from "./types/enums/order.enum";
import {PharmacyModelInterface} from "../schemas/pharmacy.schema";
import {CartModelInterface} from "../schemas/cart.schema";
import {PaymentBucketStatusEnum, PaymentTypeEnum} from "./types/enums/paymentBucket.enum";
import {OrderModelInterface} from "../schemas/order.schema";
import {OrderHelper} from "./helper/order.helper";
import {BucketService} from "./bucket.service";
import * as _ from 'lodash';
import {OrderService} from "./order.service";
import {RiderService} from "../rider/rider.service";
import {ChatBucketService} from "./chatBucket.service";
import {PaymentBucketService} from "./paymentBucket.service";
import {NotificationsService} from "../notifications/notifications.service";

@Injectable()
export class RiderBucketService {
  constructor(
    @InjectModel('RiderBucket')
    private readonly riderBucketModel: Model<RiderBucketModelStructure>,
    @Inject(forwardRef(() => OrderHelper))
    private readonly orderHelper: OrderHelper,
    private readonly bucketService: BucketService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => RiderService))
    private readonly riderService: RiderService,
    private readonly chatBucketService: ChatBucketService,
    private readonly paymentBucketService: PaymentBucketService,
    private readonly notificationsService: NotificationsService
  ) {
  }

  // create
  async create(riderBucket: RiderBucketModelInterface): Promise<RiderBucketModelInterface> {
    try {
      return (await this.riderBucketModel.create(riderBucket)).toObject();
    } catch (e) {
      console.error(e);
    }
  }

  // read
  async getNearestContract(coordinates: number[], pharmacy: string) {
    try {
      return await this.riderBucketModel.aggregate([
        {
          "$geoNear": {
            "near": {
              type: "Point", coordinates: coordinates
            },
            "distanceMultiplier": 0.001,
            "spherical": true,
            "distanceField": "distance",
            "includeLocs": "locs",
            "maxDistance": 1,  //km
            "uniqueDocs": true,
            "query": {
              status: "ACCEPTED",
              pharmacy: mongoose.Types.ObjectId(pharmacy),
              "buckets.2": {"$exists": false} // Constant
            }
          },
        }, {
          "$addFields": {
            "shipmentAddresses": {
              "$filter": {
                "input": "$shipmentAddresses",
                "as": "shipmentAddress",
                "cond": {"$eq": ["$$shipmentAddress.coordinates", "$locs"]}
              }
            }
          }
        }, {$sort: {distance: 1}}
      ])
    } catch (e) {
      console.error(e);
    }
  }

  async findOne(where: any, populate: any) {
    try {
      return await this.riderBucketModel.findOne(where).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  // update
  async updateRiderBucket(riderBucketId: string, updatedRiderBucket: PartialRiderBucketModelInterface) {
    try {
      return await this.riderBucketModel.findOneAndUpdate(
        {_id: riderBucketId},
        {
          $set: updatedRiderBucket,
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async findOneAndUpdate(riderBucketId: string, updatedRiderBucket: any, populate: any) {
    try {
      return await this.riderBucketModel.findOneAndUpdate(
        {_id: riderBucketId},
        updatedRiderBucket,
        {new: true}).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async updateRiderBucketPopulate(riderBucketId: string, updatedRiderBucket: PartialRiderBucketModelInterface, populate: any) {
    try {
      return await this.riderBucketModel.findOneAndUpdate(
        {_id: riderBucketId},
        {
          $set: updatedRiderBucket,
        },
        {new: true}).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async patchRiderBucket(body: RiderBucketPatchDTO): Promise<RiderBucketModelInterface> {
    const {riderBucketId, bucketId, status} = body
    const riderBucket: RiderBucketModelInterface = await this.findOne({_id: riderBucketId}, {
      path: 'buckets runningBucket',
      populate: {path: "products.product orderId riderId userId pharmacy cart riderBucket paymentBucket"}
    })
    if (_.isEmpty(riderBucket))
      throw new UnprocessableEntityException("Invalid Contract")
    const buckets = riderBucket.buckets as BucketModelInterface[]
    const pharmacyBucket = buckets.find(bucket => bucket['_id'].toString() === bucketId)
    if (_.isEmpty(pharmacyBucket))
      throw new UnprocessableEntityException("Invalid Contract Bucket")

    if (pharmacyBucket.status === BucketStatusEnum.RIDER_CONFIRMED && status === BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY) {
      // *eta and detail of rider then add this to notification payload for pharmacy
      // notify pharmacy that the rider has confirmed the order
      const bucketIds = buckets.map(bucket => bucket['_id'].toString()) as string[]
      const notificationPayload = _.cloneDeep(pharmacyBucket)
      delete notificationPayload.orderId
      delete notificationPayload.pharmacy
      await this.notificationsService.sendNotificationsToPharmacy({enum: BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY, ...notificationPayload}, pharmacyBucket.pharmacy['_id'].toString())
      await this.bucketService.changeBucketsStatus(bucketIds, BucketStatusEnum.RIDER_COLLECTING_THE_ORDER_FROM_PHARMACY)
      return await this.findOne({_id: riderBucket['_id'].toString()}, {
        path: 'buckets runningBucket',
        populate: {path: "products.product orderId riderId userId pharmacy cart riderBucket"}
      })
    }

    if (pharmacyBucket.status === BucketStatusEnum.RIDER_COLLECTING_THE_ORDER_FROM_PHARMACY && status === BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY) {
      //notify the pharmacy to take their actions
      const notificationRiderBucket = _.clone(riderBucket, true);
      delete notificationRiderBucket.runningBucket
      delete notificationRiderBucket.buckets
      await this.notificationsService.sendNotificationsToPharmacy({enum: BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY, ...notificationRiderBucket}, riderBucket.pharmacy['_id'].toString())
      // notify each user with their shipment address estimations
      for (const bucket of buckets) {
        // *eta and detail of rider then add this to notification payload of user
        let pharmacy = _.cloneDeep(bucket.pharmacy as PharmacyModelInterface)
        let origin = pharmacy.address.location.coordinates.reverse().join(',')
        const destination = _.cloneDeep((bucket.cart as CartModelInterface).shipmentAddress.location.coordinates).reverse().join(',')
        const {distance, eta} = await this.orderHelper.calculateETAAndDistance(destination, origin)
        // create chat
        const chatBucket = await this.chatBucketService.create({
          bucket: bucket['_id'].toString(),
          messages: []
        })
        const updatedBucket = await this.bucketService.update({_id: bucket['_id'].toString()}, {
          status: BucketStatusEnum.RIDER_ON_THE_WAY_TO_USER,
          patientDistance: distance,
          patientEta: eta,
          chatBucket: chatBucket['_id'].toString()
        })
        await this.notificationsService.sendRiderPickedNotificationToPatient({
          topic: bucket.userId['_id'].toString(),
          data: {bucketId: updatedBucket['_id'].toString()},
          tag: updatedBucket['_id'].toString(),
          collapseKey: `${updatedBucket.orderId.toString()}_${updatedBucket['_id'].toString()}`
        });
      }

      return await this.findOneAndUpdate(riderBucket['_id'].toString(), {
        $set: {status: RiderBucketEnum.PICKED}
      }, {
        path: 'buckets runningBucket',
        populate: {path: "products.product orderId riderId userId pharmacy cart"}
      })
    }

    if (pharmacyBucket.status === BucketStatusEnum.RIDER_ON_THE_WAY_TO_USER && status === BucketStatusEnum.RIDER_ARRIVED_TO_USER) {
      // notify user
      //todo: can be optimized in testing if runningBucket already populated
      const {runningBucket} = riderBucket
      const populatedBucket = await this.bucketService.getCustomPopulatedBucketById(runningBucket['_id'].toString(), "products.product orderId riderId userId paymentBucket")
      await this.notificationsService.sendRiderArrivedNotificationToPatient({
        topic: populatedBucket.userId['_id'].toString(),
        data: {bucketId: populatedBucket['_id'].toString()},
        tag: populatedBucket['_id'].toString(),
        collapseKey: `${populatedBucket.orderId.toString()}_${populatedBucket['_id'].toString()}`
      });
      await this.bucketService.changeBucketStatus(runningBucket['_id'].toString(), BucketStatusEnum.RIDER_WAITING_FOR_USER)
      return await this.findOne({_id: riderBucket['_id'].toString()}, {
        path: 'buckets runningBucket',
        populate: {path: "products.product orderId riderId userId pharmacy cart"}
      })
    }

    if (pharmacyBucket.status === BucketStatusEnum.RIDER_WAITING_FOR_USER && status === BucketStatusEnum.USER_CAME_TO_RIDER_TO_PICK_ORDER) {
      const runningBucket = riderBucket.runningBucket as BucketModelInterface
      // check if cod then set status to ASK_FOR_CASH else BUCKET_DELIVERED
      if (runningBucket.paymentBucket['type'] === PaymentTypeEnum.CASH_ON_DELIVERY) {
        await this.bucketService.changeBucketStatus(runningBucket['_id'].toString(), BucketStatusEnum.RIDER_ASK_FOR_PAYMENT)
        await this.notificationsService.sendBucketPaymentNotificationToPatient({
          topic: runningBucket.userId['_id'].toString(),
          data: {bucketId: runningBucket['_id'].toString()},
          tag: runningBucket['_id'].toString(),
          collapseKey: `${runningBucket.orderId.toString()}_${runningBucket['_id'].toString()}`
        });
        return await this.findOne({_id: riderBucket['_id'].toString()}, {
          path: 'buckets runningBucket',
          populate: {path: "products.product orderId riderId userId pharmacy cart"}
        })
      }

      if (runningBucket.paymentBucket['type'] === PaymentTypeEnum.CREDIT_DEBIT) {
        return await this.riderBucketDelivered(riderBucket)
      }
    }

    if (pharmacyBucket.status === BucketStatusEnum.RIDER_ASK_FOR_PAYMENT && status === BucketStatusEnum.RIDER_RECEIVED_PAYMENT) {
      // notify user
      return await this.riderBucketDelivered(riderBucket)
    }
    throw new UnprocessableEntityException('Bucket not in this state')
  }

  private async riderBucketDelivered(riderBucket: RiderBucketModelInterface): Promise<RiderBucketModelInterface> {
    const runningBucket = riderBucket.runningBucket as BucketModelInterface
    await this.bucketService.changeBucketStatus(runningBucket['_id'].toString(), BucketStatusEnum.BUCKET_DELIVERED)
    await this.paymentBucketService.findOneAndUpdate(runningBucket['_id'].toString(), {status: PaymentBucketStatusEnum.PAID})

    // order Completed notify to user
    const order = runningBucket.orderId as OrderModelInterface
    let allBucketsDone = order.deliveredBuckets.length + 1 === order.buckets.length
    await this.orderService.update({_id: runningBucket.orderId['_id'].toString()}, {
      ...(allBucketsDone && {status: OrderStatusEnum.COMPLETED}),
      $push: {
        deliveredBuckets: runningBucket['_id'],
        unratedBuckets: runningBucket['_id']
      }
    })
    if (!allBucketsDone)
      await this.notificationsService.sendBucketDeliveredNotificationToPatient({
        topic: runningBucket.userId['_id'].toString(),
        data: {bucketId: runningBucket['_id'].toString()},
        tag: runningBucket['_id'].toString(),
        collapseKey: `${runningBucket.orderId.toString()}_${runningBucket['_id'].toString()}`
      });

    if (allBucketsDone)
      await this.notificationsService.sendOrderCompleteNotificationToPatient({
        topic: runningBucket.userId['_id'].toString(),
        data: {orderId: order['_id'].toString()},
        collapseKey: runningBucket.orderId.toString()
      });

    const updatedRiderBucket = await this.updateRiderBucket(riderBucket['_id'].toString(), {
      deliveredBuckets: riderBucket.deliveredBuckets ? [...riderBucket.deliveredBuckets, runningBucket['_id'].toString()] : [runningBucket['_id'].toString()]
    })

    // notify rider to move to next bucket if any in contract
    if (updatedRiderBucket.deliveredBuckets.length < updatedRiderBucket.buckets.length) {
      // move to next contract bucket
      return await this.updateRiderBucketPopulate(riderBucket['_id'].toString(), {
        runningBucket: riderBucket.buckets[updatedRiderBucket.deliveredBuckets.length]
      }, {
        path: 'buckets runningBucket',
        populate: {path: "products.product orderId riderId userId pharmacy cart riderBucket"}
      })
    }
    // if all buckets are delivered then contract successfully completed
    if (updatedRiderBucket.buckets.length === updatedRiderBucket.deliveredBuckets.length) {
      // contract successfully completed
      return await this.updateRiderBucketPopulate(riderBucket['_id'].toString(), {
        status: RiderBucketEnum.COMPLETED
      }, {
        path: 'buckets runningBucket',
        populate: {path: "products.product orderId riderId userId pharmacy cart riderBucket"}
      })
    }
  }

}