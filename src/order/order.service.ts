/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {OrderModelInterface, OrderModelStructure} from '../schemas/order.schema';
import {Model} from 'mongoose';
import {CartModelInterface} from '../schemas/cart.schema';
import {StringUtils} from '../helpers/utils/string.utils';
import {ProductService} from '../product/product.service';
import * as _ from 'lodash';
import {User} from '../schemas/interfaces/user.interface';
import {SubmitOrderDTO} from './types/dto/order.dto';
import {
  NearestPharmacyProductInterface,
  PharmacyProductObjectInterface,
  ProductQuantityInterface
} from '../product/types/interfaces/product.interface';
import {OrderHelper} from './helper/order.helper';
import {CartService} from '../cart/cart.service';
import {MockedBucket} from './test/order.mock';
import {BucketStatusEnum, OrderStatusEnum} from './types/enums/order.enum';
import {HttpErrors} from '../common/errors';
import {BucketService} from './bucket.service';
import {BucketModelInterface} from '../schemas/bucket.schema';
import {QueuesService} from "../queues/queues.service";
import {BucketPatchDTO} from "../pharmacy/types/dto/pharmacy.dto";
import {RiderModelStructure} from "../schemas/rider.schema";
import {ErrorUtils} from "../helpers/utils/error.utils";
import {RiderBucketService} from "./riderBucket.service";
import {RiderBucketModelInterface} from "../schemas/riderBucket.schema";
import {PharmacyService} from "../pharmacy/pharmacy.service";
import {PharmacyModelInterface} from "../schemas/pharmacy.schema";
import {PaymentBucketModelInterface} from "../schemas/paymentBucket.schema";
import {REMOVE_BUCKETS_STATUSES} from "../common/constants.common";
import {PatientActionType, PharmacyActionType} from "./types/enums/notification.enum";
import {Review, UnRatedOrdersResponse} from "./types/interfaces/order.interface";
import {LatLngArray} from "@googlemaps/google-maps-services-js/dist";
import {NotificationsService} from "../notifications/notifications.service";
import {findUnratedOrders} from "./entities/aggregations/user-unRated-orders";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private readonly orderModel: Model<OrderModelStructure>,
    @InjectModel('Rider')
    private readonly riderModel: Model<RiderModelStructure>,
    private readonly bucketService: BucketService,
    private readonly productService: ProductService,
    private readonly errorUtils: ErrorUtils,
    @Inject(forwardRef(() => OrderHelper))
    private readonly orderHelper: OrderHelper,
    private readonly stringUtils: StringUtils,
    private readonly cartService: CartService,
    private readonly queuesService: QueuesService,
    @Inject(forwardRef(() => RiderBucketService))
    private readonly riderBucketService: RiderBucketService,
    @Inject(forwardRef(() => PharmacyService))
    private readonly pharmacyService: PharmacyService,
    private readonly notificationsService: NotificationsService
  ) {
  }


  // create
  async create(order: OrderModelInterface): Promise<OrderModelInterface> {
    try {
      const newOrder = (await this.orderModel.create(order)).toObject();
      return newOrder;
    } catch (e) {
      console.error(e);
    }
  }

  // read
  async getOrdersHistory(userId: string): Promise<any> {
    try {
      const found = await this.orderModel.find({orderPlacedBy: userId})
        .populate("").sort({createdAt: -1})  // latest on top
        .lean();
      return {orders: found};
    } catch (e) {
      console.error(e);
    }
  }

  async getOrderById(orderId: string): Promise<OrderModelInterface> {
    try {
      const order = await this.orderModel.findById(orderId).lean()
      return order
    } catch (e) {
      console.log(e)
    }
  }

  async getCustomPopulatedOrderById(orderId: string, populate: any): Promise<OrderModelInterface> {
    try {
      const order = await this.orderModel.findById(orderId).populate(populate).populate("unratedBuckets").lean()
      return order
    } catch (e) {
      console.log(e)
    }
  }

  async getPharmacyOrders(pharmacyId: string, status?: BucketStatusEnum): Promise<BucketModelInterface[]> {
    return this.bucketService.getPharmacyBuckets(pharmacyId, status);
  }

  async runningOrders(user: User): Promise<any> {
    try {
      return this.orderModel.find({
        status: OrderStatusEnum.RUNNING,
        orderPlacedBy: user._id.toString()
      }).lean();
    } catch (e) {
      console.error(e);
    }

  }

  //update
  async update(where: any, data: any, options?: any): Promise<OrderModelInterface> {
    try {
      const updated = await this.orderModel.updateMany(where, data, options);
      return updated;
    } catch (e) {
      console.error(e);
    }
  }

  async patchPharmacyBucket(body: BucketPatchDTO, user: User): Promise<BucketModelInterface | RiderBucketModelInterface> {
    try {
      const {orderId, bucketId, status} = body
      const order = await this.getOrderById(orderId)
      if (_.isEmpty(order)) throw new UnprocessableEntityException('order does not exist')
      const orderBuckets = []
      for (const bucket of order.buckets) {
        orderBuckets.push(bucket['_id'] + "")
      }
      if (!orderBuckets.includes(bucketId)) throw new UnprocessableEntityException('Bucket not belongs to this order')
      // check pharmacy own this bucket
      const pharmacyBucket = await this.bucketService.getCustomPopulatedBucketById(bucketId, "products.product orderId riderId userId paymentBucket")
      if (_.isEmpty(pharmacyBucket)) throw new UnprocessableEntityException('bucket does not exist')
      if (pharmacyBucket.status === BucketStatusEnum.USER_PAYMENT_REJECTED) throw new UnprocessableEntityException('Payment Rejected from Patient for this bucket')
      const pharmacyId = user['user'].toString()
      if (pharmacyBucket.pharmacy.toString() !== pharmacyId) throw new UnprocessableEntityException('Bucket does not belongs to this pharmacy')
      if ([BucketStatusEnum.PHARMACY_PROCESSING, BucketStatusEnum.RIDER_NOT_FOUND].includes(pharmacyBucket.status) && status === BucketStatusEnum.PHARMACY_PREPARED) {
        const riderBucket = await this.orderHelper.adjustInAnotherRiderBucket(bucketId)
        if (_.isEmpty(riderBucket)) {
          return await this.orderHelper.bucketBroadCastToNearRider(bucketId)
        }
        return riderBucket
      }
      throw new UnprocessableEntityException('Bucket not in this state')
    } catch (e) {
      console.log(e)
      this.errorUtils.errorHandler(e)
    }
  }

  async findOneAndUpdate(orderId: string, updatedOrderModel: any, populate: any) {
    try {
      return await this.orderModel.findOneAndUpdate(
        {_id: orderId},
        updatedOrderModel,
        {new: true}).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async splitOrders(cart: CartModelInterface, user: User): Promise<any> {
    // here productId is drug-code
    try {
      let bucketList: BucketModelInterface[] = [];
      let prescriptionBucketList: BucketModelInterface[] = [];
      let pharmaciesProductsObjects: PharmacyProductObjectInterface;
      //create General medicine bucket list
      if (cart.products.length) {
        const productIds: string[] = cart.products.map((prod: ProductQuantityInterface) => prod.productId);
        const products: NearestPharmacyProductInterface[] | {error?: string} = await this.productService.findAndSort(productIds, _.clone(cart.shipmentAddress.location.coordinates, true));

        if (!products || (products as {error?: string}).error) {
          return ({
            error: HttpErrors.UNPROCESSABLE_ENTITY,
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Pharmacy not found11',
          });
        }

        const cartId = cart['_id'].toString() + '';

        const availableProducts = _.groupBy(products, prod => prod.pharmacy?._id.toString());
        pharmaciesProductsObjects = Object.keys(availableProducts)?.reduce((prev, k) => {
          const distance = availableProducts[k][0]?.pharmacy?.route.distance.value;
          prev[k] = {products: availableProducts[k], distance};
          return prev;
        }, {});

        bucketList.push(...await this.orderHelper.createBucketList(pharmaciesProductsObjects, cart.products, cartId, user._id, BucketStatusEnum.WAITING_USER_PREVIEW_CONFIRMATION))
      }
      // create prescription bucketList
      let pharmacyId
      let latLng = cart.shipmentAddress.location.coordinates.slice() as LatLngArray
      const pharmacies: Array<PharmacyModelInterface> = await this.pharmacyService.getNearByPharmacies(latLng.reverse().toString(), 1000)
      const nearByOnlinePharmacyIds = pharmacies.map(pharmacy => pharmacy['_id'].toString())
      if (bucketList.length) {
        pharmacyId = bucketList[0].pharmacy.toString()
        prescriptionBucketList.push(...await this.orderHelper.createPrescriptionBucketList(cart, pharmacyId))
      } else {
        if (pharmacies.length) {
          pharmacyId = pharmacies[0]['_id'].toString()
          prescriptionBucketList.push(...await this.orderHelper.createPrescriptionBucketList(cart, pharmacyId))
        }
      }

      bucketList.push(...prescriptionBucketList)
      if (!bucketList.length) {
        return ({
          error: HttpErrors.UNPROCESSABLE_ENTITY,
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Pharmacy not found22',
        });
      }
      // create buckets
      const bucketsCreated = await this.bucketService.create(bucketList);
      const order: OrderModelInterface = {
        to: cart.shipmentAddress,
        orderPlacedBy: cart.user,
        buckets: bucketsCreated.map(b => b['_id']),
        allBuckets: bucketsCreated.map(b => b['_id']),
        pendingPharmacyConfirmBucket: bucketsCreated.map(b => b['_id']),
        status: OrderStatusEnum.RUNNING
      };

      const bucketsPopulated = await this.bucketService.findByIdsAndPopulate(bucketsCreated.map(b => b['_id']), 'products.product pharmacy prescriptions.prescriptionId');
      const orderCreated = await this.create(order);

      // updating bucket references
      await this.bucketService.update(
        {_id: {$in: bucketsCreated.map(b => b['_id'])}},
        {$set: {orderId: orderCreated['_id']}});

      // cache next nearest pharmacies
      await this.orderHelper.cacheNextPharmacies(orderCreated['_id'], pharmaciesProductsObjects);
      await this.orderHelper.cacheNextPrescriptionPharmacies(orderCreated['_id'] + "_prescription", nearByOnlinePharmacyIds);
      return {orderId: orderCreated['_id'], buckets: bucketsPopulated};
    } catch (e) {
      console.log(e)
    }
  }

  async submitOrders({subOrdersIds, orderId}: SubmitOrderDTO): Promise<any> {
    try {
      const updatedBuckets = await this.bucketService.changeBucketsStatus(subOrdersIds, BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION);
      // send notifications to pharmacies;
      const buckets = await this.bucketService.getBucketsByIds(subOrdersIds);
      for (const bucket of buckets) {
        const timeStamp = await this.queuesService.pharmacyWaitingOrder(bucket)
        const updatedBucket = await this.bucketService.updateBucketTimeStamp(bucket['_id'].toString(), timeStamp);
        await this.notificationsService.sendNotificationsToPharmacy({orderId, ...updatedBucket}, bucket.pharmacy.toString());
      }
      return buckets;

    } catch (e) {
      console.error(e);
    }
  }

  async proceedWithoutSomeBuckets(orderId: string, removingBucketIds: string[], status: BucketStatusEnum): Promise<OrderModelInterface> {
    try {
      const updatedOrder = await this.removeBucketsFromOrder(orderId, removingBucketIds, status)
      // if order all buckets are removed
      if (!updatedOrder?.buckets.length) {
        await this.findOneAndUpdate(orderId, {$set: {status: OrderStatusEnum.CANCELLED}}, "")
      }
      /** action specific notifications **/
      await this.sendNotificationToPharmacy(orderId, PharmacyActionType.USER_CANCEL_THE_BUCKET)
      await this.sendNotificationToPatient(orderId, PatientActionType.ORDER_CANCELLED)

      return updatedOrder
    } catch (e) {
      throw e
    }
  }

  async removeBucketsFromOrder(orderId: string, removingBucketIds: string[], status: BucketStatusEnum): Promise<OrderModelInterface> {
    /**Data Collection*/
    const order = await this.getCustomPopulatedOrderById(orderId, {
      path: "buckets",
      populate: {path: "paymentBucket"}
    })
    if (_.isEmpty(order)) throw new NotFoundException('Incorrect Order passed')
    const {buckets} = order as OrderModelInterface
    const removingBuckets: BucketModelInterface[] = []
    const bucketIds: string[] = (buckets as BucketModelInterface[]).map(bucket => {
      if (removingBucketIds.includes(bucket['_id'].toString())) removingBuckets.push(bucket)
      return bucket['_id'].toString()
    })

    /**Validations*/
    // check all ids belongs to this order
    // check the statuses of each removing buckets
    if (!buckets.length)
      throw new UnprocessableEntityException('No Bucket Left to cancel')
    removingBuckets.forEach(bucket => {
      if (!bucketIds.includes(bucket['_id'].toString())) throw new UnprocessableEntityException('Invalid bucketId in given list')
      if (!REMOVE_BUCKETS_STATUSES.includes(bucket.status)) throw new UnprocessableEntityException('Any Bucket not in required state')
    })

    /**Logic*/
    await this.bucketService.changeBucketsStatus(removingBucketIds, status)
    const cancelledBuckets = [...removingBucketIds]
    const remainingBuckets = (buckets as string[]).filter(bucket => !cancelledBuckets.includes(bucket['_id'].toString()))
    const total = await this.orderModelPriceCalculation(order)

    return await this.findOneAndUpdate(orderId, {
      $set: {buckets: remainingBuckets, cancelledBuckets, pendingPharmacyConfirmBucket: remainingBuckets, total}
    }, "")
  }

  async dbOrderPriceCalculation(orderId: string): Promise<number> {
    try {
      const order = await this.getCustomPopulatedOrderById(orderId, {
        path: "buckets",
        populate: {path: "paymentBucket"}
      })
      let total = 0
      const {buckets} = order
      for (const bucket of buckets) {
        const {paymentBucket} = bucket as BucketModelInterface
        total += (paymentBucket as PaymentBucketModelInterface).total
      }
      return total
    } catch (e) {
      console.log(e)
    }
  }

  async orderModelPriceCalculation(order: OrderModelInterface): Promise<number> {
    try {
      let total = 0
      const {buckets} = order
      for (const bucket of buckets) {
        const {paymentBucket} = bucket as BucketModelInterface
        if (paymentBucket)
          total += (paymentBucket as PaymentBucketModelInterface).total
      }
      return total
    } catch (e) {
      console.log(e)
    }
  }

  // notification
  async sendOrderToPharmacy(pharmacyId: string): Promise<boolean> {
    return this.notificationsService.sendNotificationToTopic(pharmacyId, {data: JSON.stringify(MockedBucket)});
  }

  private async sendNotificationToPharmacy(orderId: string, action: PharmacyActionType) {
    const order = await this.getCustomPopulatedOrderById(orderId, "cancelledBuckets")
    if (_.isEmpty(order)) throw new NotFoundException('Order not Found')
    switch (action) {
      case PharmacyActionType.USER_CANCEL_THE_BUCKET:
        const {cancelledBuckets, notifiedBuckets, buckets} = order
        for (const bucket of cancelledBuckets) {
          const notificationBucket = _.cloneDeep(bucket)
          if (!notifiedBuckets.includes(bucket['_id'].toString())) {
            const {pharmacy} = bucket as BucketModelInterface;
            await this.notificationsService.sendNotificationsToPharmacy({enum: PharmacyActionType.USER_CANCEL_THE_BUCKET, ...notificationBucket}, pharmacy.toString())
          }
        }
        break
      case PharmacyActionType.BUCKET_CANCELLED_IN_PAYMENT:
        break
    }
  }

  private async sendNotificationToPatient(orderId: string, action: PatientActionType) {
    const order = await this.getCustomPopulatedOrderById(orderId, "cancelledBuckets")
    if (_.isEmpty(order)) throw new NotFoundException('Order not Found')
    switch (action) {
      case PatientActionType.ORDER_CANCELLED:
        const {buckets, orderPlacedBy} = order
        if (!buckets.length) {
          await this.notificationsService.sendOrderCancelledNotificationToPatient({
            topic: orderPlacedBy.toString(),
            data: {orderId: order['_id'].toString()},
            collapseKey: order['_id'].toString()
          })
        }
        break

    }
  }

  async bucketSetToProcessing(bucketId: string) {
    await this.bucketService.update({_id: bucketId}, {
      $set: {requestedRiders: []},
      $unset: {riderId: undefined, riderBucket: undefined}
    })
    return await this.bucketService.changeBucketStatus(bucketId, BucketStatusEnum.PHARMACY_PROCESSING);
  }

  async getPharmacyAcceptedOrders(pharmacyId: string): Promise<any> {
    return [MockedBucket, MockedBucket];
  }

  async addRatingToOrder(orderId: string, ratingObject: Review): Promise<OrderModelInterface> {
    const {rating, feedback} = ratingObject
    try {
      const bucket = await this.getCustomPopulatedOrderById(orderId, "")
      if (_.isEmpty(bucket))
        throw new UnprocessableEntityException('bucket not found')
      return this.update({_id: orderId}, {$set: {rating, feedback}}, {new: true})
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async getUnratedOrders(user: User): Promise<UnRatedOrdersResponse> {
    try {
      const unratedOrders = await this.orderModel.aggregate(findUnratedOrders(user._id.toString()))
      return {data: unratedOrders}
    } catch (e) {
      throw e
    }
  }
}
