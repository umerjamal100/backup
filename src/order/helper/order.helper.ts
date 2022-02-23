import {forwardRef, Inject, Injectable, UnprocessableEntityException} from '@nestjs/common';
import * as _ from 'lodash';
import {
  NearestPharmacyProductInterface,
  PharmacyProductObjectInterface,
  ProductQuantityInterface,
} from '../../product/types/interfaces/product.interface';
import {CartModelInterface} from '../../schemas/cart.schema';
import {RedisService} from 'nestjs-redis';
import {
  DistanceETAEstimation,
  PharmaciesCacheInterface,
  SplitOrdersInterface,
  SubOrderInterface,
  SubOrderMap,
} from '../types/interfaces/order.interface';
import {StringUtils} from '../../helpers/utils/string.utils';
import {OrderModelInterface, OrderModelStructure} from '../../schemas/order.schema';
import {FirebaseHelper} from '../../helpers/firebase.helper';
import {ProductModelInterface} from '../../schemas/product.schema';
import {
  BucketStatusEnum,
  BucketType,
  OrderStatusEnum,
  RiderBucketEnum,
  SystemRemoveBucketEnum
} from '../types/enums/order.enum';
import {BucketExtendedModel, BucketModelInterface} from '../../schemas/bucket.schema';
import {User} from '../../schemas/interfaces/user.interface';
import {InjectModel} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {BucketService} from '../bucket.service';
import {QueuesService} from '../../queues/queues.service';
import {RiderModelInterface} from '../../schemas/rider.schema';
import {RiderService} from '../../rider/rider.service';
import {OrderService} from '../order.service';
import {PaymentTypeEnum} from '../../users/types/enums/user.enum';
import {PaymentBucketService} from '../paymentBucket.service';
import {PaymentBucketStatusEnum} from '../types/enums/paymentBucket.enum';
import {GoogleMapsHelper} from '../../helpers/googleMaps.helper';
import {DistanceMatrixResponse, LatLng} from '@googlemaps/google-maps-services-js/dist';
import {AddressHelper} from '../../helpers/address.helper';
import {PharmacyModelInterface} from '../../schemas/pharmacy.schema';
import {RiderBucketService} from '../riderBucket.service';
import {IdentityPointModelStructure, RiderBucketModelInterface,} from '../../schemas/riderBucket.schema';
// @ts-ignore
import {EstimationsInterface} from "../../helpers/interfaces/googleMaps.interface";
import {PharmacyService} from "../../pharmacy/pharmacy.service";
import {PriceList} from "../../pharmacy/types/dto/pharmacy.dto";
import {NotificationsService} from "../../notifications/notifications.service";
import {AndroidMessagePriority, AndroidNotificationPriority} from "../../helpers/enum/firebase.enum";
import {NotificationData} from "../../notifications/types/notifications.type";

@Injectable()
export class OrderHelper {
  constructor(
    @InjectModel('Order')
    private readonly orderModel: Model<OrderModelStructure>,
    private readonly bucketService: BucketService,
    private readonly redisService: RedisService,
    private readonly queuesService: QueuesService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly riderService: RiderService,
    private readonly stringUtils: StringUtils,
    private readonly firebaseHelper: FirebaseHelper,
    private readonly paymentBucketService: PaymentBucketService,
    private readonly googleMapsHelper: GoogleMapsHelper,
    private readonly addressHelper: AddressHelper,
    private readonly riderBucketService: RiderBucketService,
    private readonly pharmacyService: PharmacyService,
    private readonly notificationsService: NotificationsService,
  ) {
  }

  getProdAndPharmacyMapping(products: NearestPharmacyProductInterface[]) {
    const productMapping = _.groupBy(
      products.map((prod) => ({
        internalId: prod.internalId,
        productId: prod['_id'],
        pharmacyId: prod.pharmacyId['_id'],
        distance: prod.pharmacy?.route.distance.value,
      })),
      (prod) => prod.internalId,
    );

    return Object.keys(productMapping).reduce((prev, key) => {
      const prods = productMapping[key];
      prev[key] = _.uniqBy(prods, (prod) => prod.pharmacyId);
      return prev;
    }, {});
  }

  sortPharmacies(products: NearestPharmacyProductInterface[]): PharmaciesCacheInterface[] {
    return products
      .map((prod) => ({
        pharmacyId: prod.pharmacyId['_id'],
        distance: prod.pharmacy?.route.distance.value,
        visited: false,
      }))
      .sort((a, b) => {
        if (!a.distance || !b.distance) return -1;
        return a.distance - b.distance;
      });
  }

  /**
   *
   * @param products
   * @param cart
   */
  groupAndSort(
    products: NearestPharmacyProductInterface[],
    cart: CartModelInterface,
  ): SplitOrdersInterface {
    const sorted = products
      .map((prod) => ({
        internalId: prod.internalId,
        pharmacyId: prod.pharmacyId['_id'],
        productId: prod['_id'],
        product: prod,
        quantity: cart.products.find((cartProd) => cartProd.productId === prod.internalId)
          ?.quantity,
        distance: prod.pharmacy?.route.distance.value,
      }))
      .sort((a, b) => {
        if (!a.distance || !b.distance) return -1;
        return a.distance - b.distance;
      });

    const grouped = _.groupBy(sorted, (prod) => prod.pharmacyId);
    const splitted = Object.keys(grouped).reduce((prev, curr) => {
      // if product fround in previous pharmacy
      const union = this.unionFromObjectKeys(prev);

      // only new product be in next pharmacy
      prev[curr] = this.setDifference(grouped[curr], union);
      if (!prev[curr].length) {
        prev[curr] = [{distance: grouped[curr][0].distance}];
      }
      return prev;
    }, {});

    return splitted;
  }

  setDifference(A: any[], B: any[]) {
    return A.filter((x) => !B.map((p) => p.internalId).includes(x.internalId)).filter(Boolean);
  }

  unionFromObjectKeys(obj: any) {
    const concatenated = Object.keys(obj).reduce((prev, cur) => {
      prev = [...prev, ...obj[cur]];
      return prev;
    }, []);
    return _.uniq(concatenated);
  }

  assignSubOrderIds(orders: SplitOrdersInterface): SubOrderInterface {
    return Object.keys(orders)
      .map((key) => ({[key]: {prods: orders[key], subOrderId: this.stringUtils.uuidv4()}}))
      .reduce((prev, cur) => {
        prev[Object.keys(cur)[0]] = cur[Object.keys(cur)[0]];
        return prev;
      });
  }

  async cacheSplitOrders(data: SubOrderInterface, orderId: string): Promise<any> {
    try {
      const client = await this.redisService.getClient();
      const nextPharmacy = this.getNextCandidatePharmacy(data);
      const orders = this.assignStatus(data, 'NOT_ACCEPTED_BY_PHARMACY');
      const cached = await client.set(
        orderId,
        JSON.stringify({
          cartId: data['cartId'],
          orders,
          next: nextPharmacy ?? '',
        }),
      );
      return cached;
    } catch (e) {
      console.error(e);
    }
  }

  async getCachedPharmacies(orderId): Promise<PharmacyProductObjectInterface> {
    try {
      const redisClient = await this.redisService.getClient();
      const pharmacies = await redisClient.get(orderId);
      // await redisClient.del(orderId);
      return JSON.parse(pharmacies);
    } catch (e) {
      console.error(e);
    }
  }

  async getCachedPharmaciesId(orderId): Promise<string[]> {
    try {
      const redisClient = await this.redisService.getClient();
      const pharmacies = await redisClient.get(orderId);
      // await redisClient.del(orderId);
      return JSON.parse(pharmacies);
    } catch (e) {
      console.error(e);
    }
  }

  async cacheNextPharmacies(orderId: string, data: PharmacyProductObjectInterface): Promise<'OK'> {
    try {
      const redisClient = await this.redisService.getClient();
      const cached = redisClient.set(orderId, JSON.stringify(data));
      return cached;
    } catch (e) {
      console.error(e);
    }
  }

  async cacheNextPrescriptionPharmacies(orderId: string, pharmacies: string[]): Promise<'OK'> {
    try {
      const redisClient = await this.redisService.getClient();
      const cached = redisClient.set(orderId, JSON.stringify(pharmacies));
      return cached;
    } catch (e) {
      console.error(e);
    }
  }

  getNextCandidatePharmacy(order: SubOrderInterface) {
    return Object.keys(order)
      .filter((k) => k !== 'cartId' && !order[k].prods.length)
      .sort(
        (a, b) =>
          (order[a].prods[0] as SubOrderMap).distance - (order[b].prods[0] as SubOrderMap).distance,
      )[0];
  }

  assignStatus(data: SubOrderInterface, status) {
    return Object.keys(data)
      .filter((k) => k !== 'cartId')
      .reduce((prev, cur) => {
        prev[cur] = {...data[cur], status};
        return prev;
      }, {});
  }

  splitOrders(grouped: SplitOrdersInterface) {
    const splitted = Object.keys(grouped).reduce((prev, curr) => {
      // if product fround in previous pharmacy
      const union = this.unionFromObjectKeys(prev);

      // only new product be in next pharmacy
      prev[curr] = this.setDifference(grouped[curr] as SubOrderMap[], union);
      return prev;
    }, {});

    return splitted;
  }

  async changeOrderStatus(orderId: string, status): Promise<OrderModelInterface> {
    try {
      return await this.orderModel
        .findOneAndUpdate(
          {_id: orderId},
          {
            $set: {status},
          },
          {new: true},
        )
        .lean();
    } catch (e) {
      console.error(e);
    }
  }

  // createOrder(data: SubOrderMap[], pharmacyId, patientId, deliveryAddress: AddressModelInterface): OrderModelInterface {
  //   const d: OrderModelInterface = {
  //     orderPlacedBy: patientId, pharmacy: pharmacyId, prescriptions: [], products: data.map(d => d.productId), status: 'initiated', to: deliveryAddress
  //   }
  //   return d;
  // }

  async createBucketList(
    pharmaciesProductsObjects: PharmacyProductObjectInterface,
    remainingProducts: Array<ProductQuantityInterface>,
    cartId: string,
    userId: string,
    status: BucketStatusEnum,
  ): Promise<BucketModelInterface[]> {
    const bucketList: BucketModelInterface[] = [];
    const sortedPharmaciesProductIdsList = Object.keys(pharmaciesProductsObjects).sort(
      (a, b) => pharmaciesProductsObjects[a].distance - pharmaciesProductsObjects[b].distance,
    );
    for (const pharmacyProductId of sortedPharmaciesProductIdsList) {
      if (!remainingProducts.length) break;
      const remainingProductIds = remainingProducts.map(
        (prod) => _.pick(prod, ['productId']).productId,
      );
      const pharmacyHavingProductIds = pharmaciesProductsObjects[pharmacyProductId].products.map(
        (prod) => _.pick(prod, ['drugCode']).drugCode,
      );
      //if all remaining products are available in the same pharmacy
      if (!_.difference(remainingProductIds, pharmacyHavingProductIds).length) {
        await this.addToBucketList(
          bucketList,
          cartId,
          pharmaciesProductsObjects,
          pharmacyProductId,
          remainingProducts,
          userId,
          status,
        );
        remainingProducts = _.reject(remainingProducts, (prod) =>
          pharmacyHavingProductIds.includes(prod.productId),
        );
        break;
      }
      const prod = remainingProducts.filter((prod) =>
        pharmacyHavingProductIds.includes(prod.productId),
      );
      if (prod.length) {
        await this.addToBucketList(
          bucketList,
          cartId,
          pharmaciesProductsObjects,
          pharmacyProductId,
          prod,
          userId,
          status,
        );
        remainingProducts = _.reject(remainingProducts, (prod) =>
          pharmacyHavingProductIds.includes(prod.productId),
        );
      }
    }

    if (remainingProducts.length) {
      // todo: {remainingProducts} products not available in any nearby Pharmacy OR (ask Admin what to do, Notify user)
      console.log('products not available in pharmacies');
    }

    return bucketList;
  }

  async addToBucketList(
    bucketList: BucketModelInterface[],
    cartId: string,
    pharmaciesProductsObjects: PharmacyProductObjectInterface,
    pharmacyId: string,
    prodQuantity: Array<ProductQuantityInterface>,
    userId: string,
    status: BucketStatusEnum,
  ) {
    const prods: Array<{product: string; quantity: number, packagePrice: number}> = prodQuantity.map((product) => {
      return {
        product: ((): string => {
          return _.find(pharmaciesProductsObjects[pharmacyId].products, {
            drugCode: product.productId,
          })._id.toString();
        })(),
        quantity: product.quantity,
        packagePrice: _.find(pharmaciesProductsObjects[pharmacyId].products, {drugCode: product.productId}).packagePrice as number
      };
    });
    let estTotal = 0
    for (const prod of prods) {
      estTotal += prod.packagePrice * prod.quantity
    }
    bucketList.push({
      orderId: '',
      type: BucketType.GENERAL,
      cart: cartId,
      pharmacy: pharmacyId,
      products: prods,
      status: status,
      total: 0,
      userId,
      estTotal: estTotal
    });
  }

  async createPrescriptionBucketList(cart: CartModelInterface, pharmacyId: string): Promise<BucketModelInterface[]> {
    const {user, prescriptions} = cart
    const prescriptionBucketList: BucketModelInterface[] = []
    if (!cart.prescriptions.length)
      return [];

    prescriptionBucketList.push({
      orderId: '',
      prescriptions: prescriptions,
      type: BucketType.PRESCRIPTION,
      cart: cart['_id'].toString(),
      pharmacy: pharmacyId,
      status: BucketStatusEnum.WAITING_USER_PREVIEW_CONFIRMATION,
      total: 0,
      userId: user,
    });

    return prescriptionBucketList
  }

  async pharmacyOrderAccepted(
    userConfirmedBucket: BucketModelInterface,
    priceList: PriceList[],
  ): Promise<BucketModelInterface> {

    const {type} = userConfirmedBucket
    let order: OrderModelInterface
    if (userConfirmedBucket.status === BucketStatusEnum.BUCKET_TIME_UP)
      throw new UnprocessableEntityException('Your Time is up for this bucket acceptance');

    switch (type) {
      case BucketType.GENERAL:
        await this.bucketService.changeBucketStatus(
          userConfirmedBucket['_id'].toString(),
          BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION,
        );
        await this.bucketService.addPaymentsToGeneralBucket(
          userConfirmedBucket['_id'],
          userConfirmedBucket.products,
        );

        order = await this.orderModel
          .findByIdAndUpdate(
            userConfirmedBucket.orderId['_id'].toString(),
            {$pull: {pendingPharmacyConfirmBucket: userConfirmedBucket['_id'].toString()}},
            {new: true},
          )
          .populate({path: 'buckets', populate: {path: 'paymentBucket'}})
          .lean();
        break
      case BucketType.PRESCRIPTION:
        if (priceList.length !== userConfirmedBucket.prescriptions.length)
          throw new UnprocessableEntityException('Problem in PriceList')
        await this.bucketService.changeBucketStatus(
          userConfirmedBucket['_id'].toString(),
          BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION,
        );

        // add payments to buckets
        await this.bucketService.addPaymentsToPrescriptionBucket(
          userConfirmedBucket['_id'],
          priceList);

        order = await this.orderModel
          .findByIdAndUpdate(
            userConfirmedBucket.orderId['_id'].toString(),
            {$pull: {pendingPharmacyConfirmBucket: userConfirmedBucket['_id'].toString()}},
            {new: true},
          )
          .populate({path: 'buckets', populate: {path: 'paymentBucket'}})
          .lean();
        break
    }

    // send notification to user if all buckets are accepted
    if (!order.pendingPharmacyConfirmBucket.length) {
      // calculate total price
      const {buckets} = order as OrderModelInterface;
      let orderTotal = 0;
      for (const bucket of buckets) {
        orderTotal += bucket['paymentBucket']['total'];
      }
      //update to order
      order = await this.orderModel
        .findOneAndUpdate(
          {_id: order['_id'].toString()},
          {
            $set: {total: orderTotal},
          },
          {new: true},
        )
        .populate({path: 'buckets', populate: {path: 'paymentBucket'}})
        .lean();
      await this.notificationsService.sendPaymentNotificationToPatient({
        topic: userConfirmedBucket.userId['_id'].toString(),
        data: {orderId: order['_id'].toString()},
        collapseKey: order['_id'].toString()
      })
    }

    return this.bucketService.getCustomPopulatedBucketById(userConfirmedBucket['_id'].toString(), "")
  }

  async pharmacyOrderRemoved(
    pharmacyBucket: BucketExtendedModel,
    reason: BucketStatusEnum,
  ): Promise<BucketModelInterface> {
    const {status, _id, pharmacy, products, cart} = pharmacyBucket as BucketExtendedModel;
    const orderId = pharmacyBucket.orderId['_id']
      ? pharmacyBucket.orderId['_id'].toString()
      : pharmacyBucket.orderId;
    const userId = pharmacyBucket.userId['_id']
      ? pharmacyBucket.userId['_id'].toString()
      : pharmacyBucket.userId;
    const pharmacyProcessedOrderStates = [
      BucketStatusEnum.PHARMACY_PREPARED,
      BucketStatusEnum.WAITING_FOR_RIDER_CONFIRMATION,
      BucketStatusEnum.RIDER_CONFIRMED,
      BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY,
      BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY,
      BucketStatusEnum.RIDER_ARRIVED_TO_USER,
    ];

    //  Flag ADDED in expired bucket document
    const updatedBucket = await this.bucketService.changeBucketStatusPopulated(_id, reason, "cart");
    await this.notificationsService.sendNotificationsToPharmacy(
      {
        enum: reason,
        ...(updatedBucket as BucketExtendedModel),
      },
      pharmacy.toString(),
    );

    //remove bucketId from order document
    await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $pull: {
            pendingPharmacyConfirmBucket: _id,
            buckets: _id
          },
        },
        {new: true},
      )
      .lean();
    let bucketList: BucketModelInterface[] = []

    if (updatedBucket.type === BucketType.GENERAL) {

      // caching manipulations
      const cachedPharmacyProduct: PharmacyProductObjectInterface = await this.getCachedPharmacies(
        orderId,
      );
      delete cachedPharmacyProduct[pharmacy.toString()];
      await this.cacheNextPharmacies(orderId, cachedPharmacyProduct);

      if (_.isEmpty(cachedPharmacyProduct)) {
        // handle case if no other cached pharmacy provide this medicine
        console.log('no other pharmacy found');
        const order = await this.orderService.proceedWithoutSomeBuckets(orderId, [_id], BucketStatusEnum.BUCKET_CANCELLED_BY_SYSTEM_WITH_REASON)
        await this.bucketService.findOneAndUpdate({_id}, {reasons: [SystemRemoveBucketEnum.NO_PHARMACY_FOUND_BY_SYSTEM]}, "")
        if (!order.pendingPharmacyConfirmBucket.length && order.buckets.length)
          await this.notificationsService.sendPaymentNotificationToPatient({
            topic: userId,
            data: {orderId: order['_id'].toString()},
            collapseKey: order['_id'].toString()
          })
        return updatedBucket;
      }


      //find next suitable pharmacies for this bucket
      const remainingProducts: Array<ProductQuantityInterface> = products.map(
        (product: {product: ProductModelInterface; quantity: number}) => {
          return {
            productId: product.product.drugCode,
            quantity: product.quantity,
          };
        },
      );
      bucketList = await this.createBucketList(
        cachedPharmacyProduct,
        remainingProducts,
        cart as string,
        userId,
        BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION,
      );
    }
    let prescriptionBucketList: BucketModelInterface[] = [];

    if (updatedBucket.type === BucketType.PRESCRIPTION) {
      // caching manipulations
      const pharmaciesId: string[] = await this.getCachedPharmaciesId(
        orderId + "_prescription",
      );
      pharmaciesId.splice(pharmaciesId.indexOf(updatedBucket.pharmacy.toString()), 1);
      await this.cacheNextPrescriptionPharmacies(orderId + "_prescription", pharmaciesId);

      if (_.isEmpty(pharmaciesId)) {
        // handle case if no other cached pharmacy provide this medicine
        console.log('no other pharmacy found');
        return updatedBucket;
      }
      // create prescription bucketList
      prescriptionBucketList.push(...await this.createPrescriptionBucketList(updatedBucket.cart as CartModelInterface, pharmaciesId[0]))
      prescriptionBucketList.forEach(bucket => bucket.orderId = orderId)
    }
    bucketList.push(...prescriptionBucketList)
    // check any other bucket with same orderId and pharmacy
    if (bucketList.length) {
      if (updatedBucket.type === BucketType.GENERAL) {
        for (const bucket of bucketList) {
          const {pharmacy} = bucket;
          bucket.orderId = orderId;
          const bucketFound = await this.bucketService.getPharmacyOtherBucketsOfSameOrder(
            orderId,
            pharmacy as string,
          );
          if (bucketFound) {
            if (bucketFound.status === BucketStatusEnum.BUCKET_TIME_UP) continue;
            if (!pharmacyProcessedOrderStates.includes(bucketFound.status)) {
              const mergedBucket = await this.bucketService.mergeBuckets(bucket, bucketFound);
              await this.notificationsService.sendNotificationsToPharmacy(
                {orderId, ...bucket},
                bucket.pharmacy.toString(),
              );
              bucketList = bucketList.filter(
                (buck) => buck['_id'].toString() === bucket['_id'].toString(),
              );
            }
          }
        }
      }
      const bucketsCreated = await this.bucketService.create(bucketList);
      for (const bucket of bucketsCreated) {
        const populatedBucket = await this.bucketService.getCustomPopulatedBucketByObject({_id: bucket['_id'].toString()}, "products.product prescriptions.prescriptionId")
        await this.orderModel.findByIdAndUpdate(orderId, {
          $push: {
            pendingPharmacyConfirmBucket: populatedBucket['_id'],
            buckets: populatedBucket['_id'],
            allBuckets: populatedBucket['_id']
          },
        });
        const timeStamp = await this.queuesService.pharmacyWaitingOrder(populatedBucket);
        await this.notificationsService.sendNotificationsToPharmacy({
          orderId, ...populatedBucket,
          timeStamp: timeStamp
        }, bucket.pharmacy.toString());
        await this.bucketService.updateBucketTimeStamp(
          populatedBucket['_id'].toString(),
          timeStamp,
        );
      }
    }

    return updatedBucket;
  }

  async userPaymentReject(
    orderId: string,
    patient: User,
    action: BucketStatusEnum,
  ): Promise<OrderModelInterface> {
    const order = await this.orderService.getCustomPopulatedOrderById(orderId, "buckets");

    const buckets = order.buckets as BucketModelInterface[];
    for (const bucket of buckets) {
      const {status} = bucket;
      if (status !== BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION)
        throw new UnprocessableEntityException('Any Bucket not in Payment state');
    }

    await this.bucketService.changeBucketsStatus(
      buckets.map((b) => b['_id'].toString()),
      action,
    );
    await this.changeOrderStatus(orderId, OrderStatusEnum.CANCELLED);
    order.status = OrderStatusEnum.CANCELLED;
    await this.paymentBucketService.updatePaymentBucketsStatus(
      buckets.map((b) => b['_id'].toString()),
      PaymentBucketStatusEnum.CANCELLED,
    );

    order.buckets = buckets.map((bucket) => {
      return {...bucket, status: action};
    });
    await this.notificationsService.sendNotificationsToOrderPharmacies(order.buckets);
    return order;
  }

  async userPaymentAccept(
    orderId: string,
    patient: User,
    action: BucketStatusEnum,
    paymentType: PaymentTypeEnum,
  ): Promise<OrderModelInterface> {
    const order = await this.orderService.getCustomPopulatedOrderById(orderId, "buckets");

    const buckets = order.buckets as BucketModelInterface[];
    for (const bucket of buckets) {
      const {status} = bucket;
      if (status !== BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION)
        throw new UnprocessableEntityException('Any Bucket not in Payment state');
    }

    await this.bucketService.changeBucketsStatus(
      buckets.map((b) => b['_id'].toString()),
      BucketStatusEnum.PHARMACY_PROCESSING,
    );
    // update all the paymentBuckets
    if (paymentType === PaymentTypeEnum.CREDIT_DEBIT) {
      await this.paymentBucketService.updateBucketPaymentTypeCreditDebit(
        buckets.map((b) => b['_id'].toString()),
      );
    }
    if (paymentType === PaymentTypeEnum.CASH_ON_DELIVERY) {
      await this.paymentBucketService.updateBucketPaymentTypeCashOnDelivery(
        buckets.map((b) => b['_id'].toString()),
      );
    }

    order.buckets = buckets.map((bucket) => {
      return {...bucket, status: action};
    });
    const payloads: NotificationData[] = []
    for (const bucket of order.buckets) {
      payloads.push({
        topic: bucket.userId.toString(),
        data: {bucketId: bucket['_id'].toString()},
        tag: bucket['_id'].toString(),
        collapseKey: `${bucket.orderId.toString()}_${bucket['_id'].toString()}`
      })
    }
    await this.notificationsService.sendBucketsNotificationToPatient(payloads)
    await this.notificationsService.sendNotificationsToOrderPharmacies(order.buckets);
    return order;
  }

  async riderBucketAccepted(
    riderBucket: RiderBucketModelInterface,
    action: BucketStatusEnum,
    origin: string,
    user: RiderModelInterface,
  ): Promise<RiderBucketModelInterface> {
    const buckets = riderBucket.buckets as BucketModelInterface[];
    const bucketIds = buckets.map((bucket) => bucket['_id'].toString());
    await this.bucketService.changeBucketsStatus(bucketIds, BucketStatusEnum.RIDER_CONFIRMED);
    let pharmacy = riderBucket.pharmacy as PharmacyModelInterface;
    let destination = pharmacy.address.location.coordinates.reverse().join(',');
    // calculate eta
    const {distance, eta} = await this.calculateETAAndDistance(destination, origin);

    const updatedRiderBucket = await this.riderBucketService.updateRiderBucketPopulate(
      riderBucket['_id'].toString(),
      {
        pharmacyDistance: distance,
        pharmacyEta: eta,
        status: RiderBucketEnum.ACCEPTED,
      },
      {
        path: 'buckets',
        populate: {path: 'products.product orderId userId pharmacy'},
      },
    );

    await this.notificationsService.sendNotificationsToPharmacy(
      {
        enum: action,
        riderBucket: updatedRiderBucket,
      },
      riderBucket.pharmacy['_id'].toString(),
    );
    return updatedRiderBucket;
  }

  async riderBucketRejected(
    riderBucket: RiderBucketModelInterface,
    action: RiderBucketEnum,
    reason: any[],
  ): Promise<RiderBucketModelInterface> {

    //add rider global state
    await this.riderService.addRiderRejectedBuckets(riderBucket.rider)

    // look for another rider job queue
    const rejectedRiderBucket = await this.riderBucketService.updateRiderBucket(
      riderBucket['_id'].toString(),
      {
        reason,
        status: action,
      },
    );
    const originBucket = riderBucket.originBucket as BucketModelInterface;
    const nearRider: RiderModelInterface = await this.riderService.getNewNearRider(
      riderBucket.pharmacy['_id'],
      originBucket.requestedRiders as string[], 1000
    );
    // update bucket
    if (!nearRider) {
      await this.bucketService.changeBucketStatus(originBucket['_id'].toString(), BucketStatusEnum.RIDER_NOT_FOUND)
      throw new UnprocessableEntityException('No nearby Rider');
    }
    // create new contract
    const newRiderBucket = await this.riderBucketService.create({
      originBucket: originBucket['_id'].toString(),
      runningBucket: originBucket['_id'].toString(),
      buckets: [originBucket['_id'].toString()],
      rider: nearRider['_id'].toString(),
      pharmacy: riderBucket.pharmacy['_id'].toString(),
    });
    await this.bucketService.patchPharmacyBucket({
      orderId: originBucket.orderId['_id'].toString(),
      bucketId: originBucket['_id'].toString(),
      riderId: nearRider['_id'].toString(),
      riderBucket: newRiderBucket['_id'].toString(),
      requestedRiders: [...originBucket.requestedRiders, nearRider['_id'].toString()],
    });

    const riderTimeStamp = await this.queuesService.CheckRiderHasConfirmedJob({
      riderBucketId: newRiderBucket['_id'].toString(),
      job: action,
    });
    const updatedNewRiderBucket = await this.riderBucketService.updateRiderBucketPopulate(
      newRiderBucket['_id'].toString(),
      {riderTimeStamp},
      {
        path: 'runningBucket',
        populate: {path: 'products.product orderId userId pharmacy cart'},
      },
    );

    await this.riderService.sendNotificationsToRider(
      {
        enum: BucketStatusEnum.PHARMACY_PREPARED,
        updatedRiderBucket: updatedNewRiderBucket,
      },
      nearRider['_id'].toString(),
    );
    await this.notificationsService.sendNotificationsToPharmacy(
      {enum: action, ...rejectedRiderBucket},
      riderBucket.pharmacy['_id'].toString(),
    );

    return rejectedRiderBucket;
  }

  async calculateETAAndDistance(destination, origin): Promise<DistanceETAEstimation> {
    const distanceMatrix: DistanceMatrixResponse = await this.googleMapsHelper.getDistanceMatrix(
      [destination],
      [origin],
    );
    let distance = '0';
    let eta = '0';
    if (distanceMatrix.data.rows.length > 0) {
      if (distanceMatrix.data.rows[0].elements.length > 0) {
        distance = distanceMatrix.data.rows[0].elements[0].distance.text;
        eta = distanceMatrix.data.rows[0].elements[0].duration.text;
      }
    }
    return {distance, eta};
  }

  async getNearestRiderBucket(riderBucketList: RiderBucketModelInterface[], newBucket: BucketModelInterface): Promise<RiderBucketModelInterface> {
    const newBucketCart = newBucket.cart as CartModelInterface
    const destinations: LatLng[] = riderBucketList.map(riderBucket => riderBucket.shipmentAddresses[0].coordinates.reverse() as LatLng)
    let minValuePosition = 0
    if (riderBucketList.length > 1) {
      const estimations: EstimationsInterface[] = await this.googleMapsHelper.singleOriginEstimationsArray(destinations, newBucketCart.shipmentAddress.location.coordinates.reverse() as LatLng)
      const durationValues: number[] = estimations.map(estimation => estimation.durationValue)
      minValuePosition = durationValues.indexOf(Math.min.apply(null, durationValues))
    }
    const nearestRiderBucket = riderBucketList[minValuePosition]
    // sort buckets according to new bucket
    const nearestBucketId: string = (nearestRiderBucket.shipmentAddresses[0] as IdentityPointModelStructure).bucket.toString()
    const position = (nearestRiderBucket.buckets as any[]).map(bucket => bucket.toString()).indexOf(nearestBucketId)
    const sort = (nearestRiderBucket.buckets as any[]).splice(position + 1, 0, mongoose.Types.ObjectId(newBucket['_id'].toString()))
    const shipmentAddress = {
      ...newBucketCart.shipmentAddress.location,
      bucket: newBucket['_id']
    } as IdentityPointModelStructure
    //  update contract with the sorted bucket
    return await this.riderBucketService.findOneAndUpdate(nearestRiderBucket['_id'].toString(), {
      $push: {
        shipmentAddresses: shipmentAddress,
      },
      $set: {buckets: nearestRiderBucket.buckets}
    }, "");
  }

  async adjustInAnotherRiderBucket(bucketId: string): Promise<BucketModelInterface> {
    const bucket = await this.bucketService.getCustomPopulatedBucketById(bucketId, "products.product orderId riderId userId pharmacy cart")
    const cart = bucket.cart as CartModelInterface
    const nearestRiderBucketList: RiderBucketModelInterface[] = await this.riderBucketService.getNearestContract(cart.shipmentAddress.location.coordinates, bucket.pharmacy['_id'].toString())
    if (nearestRiderBucketList.length > 0) {
      const riderBucket: RiderBucketModelInterface = await this.getNearestRiderBucket(nearestRiderBucketList, bucket)
      return await this.bucketService.findOneAndUpdate({_id: bucket['_id'].toString()}, {
        riderBucket: riderBucket['_id'].toString(),
        riderId: riderBucket.rider['_id'].toString(),
        requestedRiders: bucket.requestedRiders ? [...bucket.requestedRiders, riderBucket.rider['_id'].toString()] : [riderBucket.rider['_id'].toString()],
        status: BucketStatusEnum.RIDER_CONFIRMED
      }, "")

    }
    return null
  }

  async bucketBroadCastToNearRider(bucketId: string): Promise<BucketModelInterface> {
    const bucket = await this.bucketService.getCustomPopulatedBucketById(bucketId, "products.product orderId riderId userId pharmacy cart")
    const nearRider: RiderModelInterface = await this.riderService.getNewNearRider(bucket.pharmacy['_id'].toString(), bucket.requestedRiders as string[], 1000)
    if (!nearRider) {
      await this.bucketService.changeBucketStatus(bucketId, BucketStatusEnum.RIDER_NOT_FOUND)
      throw new UnprocessableEntityException('No nearby Rider')
    }
    //create contract
    const riderBucket = await this.riderBucketService.create({
      originBucket: bucket['_id'].toString(),
      runningBucket: bucket['_id'].toString(),
      buckets: [bucket['_id'].toString()],
      rider: nearRider['_id'].toString(),
      pharmacy: bucket.pharmacy['_id'].toString(),
      shipmentAddresses: [{
        type: 'Point',
        coordinates: (bucket.cart as CartModelInterface).shipmentAddress.location.coordinates,
        bucket: bucket['_id'].toString()
      } as unknown as IdentityPointModelStructure],
    })
    const riderTimeStamp = await this.queuesService.CheckRiderHasConfirmedJob({
      job: 'RIDER_CONFIRMATION_TIME_UP',
      riderBucketId: riderBucket['_id'].toString(),
    })
    const updatedRiderBucket = await this.riderBucketService.updateRiderBucketPopulate(riderBucket['_id'].toString(),
      {riderTimeStamp}, {
        path: 'runningBucket pharmacy',
      })
    // send contract
    await this.riderService.sendNotificationsToRider({
      enum: BucketStatusEnum.PHARMACY_PREPARED,
      updatedRiderBucket
    }, nearRider['_id'].toString())

    return await this.bucketService.findOneAndUpdate({_id: bucket['_id'].toString()}, {
      riderBucket: riderBucket['_id'].toString(),
      riderId: nearRider['_id'].toString(),
      requestedRiders: bucket.requestedRiders ? [...bucket.requestedRiders, nearRider['_id'].toString()] : [nearRider['_id'].toString()],
      status: BucketStatusEnum.WAITING_FOR_RIDER_CONFIRMATION
    }, "")
  }

}
