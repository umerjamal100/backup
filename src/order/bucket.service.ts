import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {
  BucketModelInterface,
  BucketModelStructure,
  PartialBucketModelInterface,
  TimeStampInterface
} from '../schemas/bucket.schema';
import {Model} from 'mongoose';
import {BucketStatusEnum} from './types/enums/order.enum';
import {ProductModelInterface} from "../schemas/product.schema";
import {PaymentBucketService} from "./paymentBucket.service";
import {PaymentBucketStatusEnum, PaymentTypeEnum} from "./types/enums/paymentBucket.enum";
import {PriceList, StatsQueryDTO} from "../pharmacy/types/dto/pharmacy.dto";
import {Review} from "./types/interfaces/order.interface";
import * as _ from 'lodash'

@Injectable()
export class BucketService {
  constructor(
    @InjectModel('Bucket')
    private readonly bucketModel: Model<BucketModelStructure>,
    private readonly paymentBucketService: PaymentBucketService,
  ) {
  }

  // create
  async create(bucket: BucketModelInterface[]): Promise<BucketModelInterface[]> {
    try {
      const bucketCreated = await this.bucketModel.create(bucket);
      return bucketCreated;
    } catch (e) {
      console.error(e);
    }
  }

  // read
  async getBucketsByIds(bucketIds: string[]): Promise<BucketModelInterface[]> {
    try {
      const updatedBucket = await this.bucketModel.find(
        {_id: {$in: bucketIds}}).populate("products.product").lean();
      return updatedBucket;
    } catch (e) {
      console.error(e);
    }
  }

  async getCustomPopulatedBucketById(_id: string, populated: any): Promise<BucketModelInterface> {
    try {
      const bucket = await this.bucketModel.findOne(
        {_id}).populate(populated).lean();
      return bucket
    } catch (e) {
      console.error(e);
    }
  }

  async getCustomPopulatedBucketByObject(object: any, populated: any): Promise<BucketModelInterface> {
    try {
      const bucket = await this.bucketModel.findOne(
        object).populate(populated).lean();
      return bucket
    } catch (e) {
      console.error(e);
    }
  }

  async getPharmacyBuckets(pharmacyId: string, status: BucketStatusEnum): Promise<BucketModelInterface[]> {
    try {
      const where: any = {
        pharmacy: pharmacyId['user']['_id'].toString(),
      };
      if (status === BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION) {
        where['status'] = [status];
      } else if (status === BucketStatusEnum.PHARMACY_PROCESSING) {
        where['status'] = [BucketStatusEnum.PHARMACY_PROCESSING, BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION]
      } else if (status === BucketStatusEnum.WAITING_FOR_RIDER_CONFIRMATION) {
        where['status'] = [BucketStatusEnum.WAITING_FOR_RIDER_CONFIRMATION,
          BucketStatusEnum.RIDER_CONFIRMED,
          BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY,
          BucketStatusEnum.RIDER_COLLECTING_THE_ORDER_FROM_PHARMACY,
          BucketStatusEnum.RIDER_NOT_FOUND]
      }
      const buckets = this.bucketModel.find(where)
        .populate('products.product riderBucket riderId')
        .lean();
      return buckets;
    } catch (e) {
      console.error(e);
    }
  }

  async getCustomStatusPharmacyBuckets(pharmacyId: string, status: BucketStatusEnum[]): Promise<BucketModelInterface[]> {
    try {
      const where: any = {
        pharmacy: pharmacyId,
      };
      where['status'] = status;

      const buckets = this.bucketModel.find(where)
        .populate('products.product')
        .lean();
      return buckets;
    } catch (e) {
      console.error(e);
    }
  }

  async getCurrentDatePharmacyBucketsWithStatus(status: BucketStatusEnum[], pharmacyId: string, query: StatsQueryDTO) {
    try {
      const {start, end} = query
      const where: any = {
        pharmacy: pharmacyId
      }
      where['status'] = status
      where['createdAt'] = {
        $gte: start,
        $lte: end
      }
      return await this.bucketModel.countDocuments(where)
    } catch (e) {
      console.log(e)
    }
  }

  async getPharmacyOtherBucketsOfSameOrder(orderId: string, pharmacyId: string): Promise<BucketModelInterface> {
    try {
      const bucket = await this.bucketModel.find({
        orderId,
        pharmacy: pharmacyId
      })
      return bucket.length ? bucket[0] : null
    } catch (e) {
      console.error(e);
    }
  }

  // update
  async update(where: any, data: any, options?: any): Promise<BucketModelInterface> {
    try {
      const updated = await this.bucketModel.updateMany(where, data, options);
      return updated;
    } catch (e) {
      console.error(e);
    }
  }

  async updateBucketTimeStamp(bucketId: string, timeStamp: TimeStampInterface): Promise<BucketModelInterface> {
    try {
      return await this.bucketModel.findOneAndUpdate(
        {_id: bucketId},
        {
          $set: {timeStamp},
        },
        {new: true}).populate('products.product').lean()
    } catch (e) {
      console.log(e)
    }
  }

  async patchPharmacyBucket(updatedBucket: PartialBucketModelInterface) {
    const {orderId, bucketId} = updatedBucket
    const newBucket = await this.bucketModel.findOneAndUpdate(
      {_id: bucketId, orderId},
      updatedBucket,
      {new: true}).lean()
    return newBucket;
  }

  async findOneAndUpdate(where: any, data: any, populate: any): Promise<BucketModelInterface> {
    try {
      return await this.bucketModel.findOneAndUpdate(where, data, {new: true}).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async findByIdsAndPopulate(bucketIds: string[], populate: any): Promise<BucketModelInterface[]> {
    try {
      return this.bucketModel.find({_id: {$in: bucketIds}}).populate(populate);
    } catch (e) {
      console.error(e);
    }
  }

  async changeBucketStatus(bucketId: string, status): Promise<BucketModelInterface> {
    try {
      return await this.bucketModel.findOneAndUpdate(
        {_id: bucketId},
        {
          $set: {status},
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async changeBucketStatusPopulated(bucketId: string, status, populate: string): Promise<BucketModelInterface> {
    try {
      return await this.bucketModel.findOneAndUpdate(
        {_id: bucketId},
        {
          $set: {status},
        },
        {new: true}).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async changeBucketsStatus(bucketIds: string[], status): Promise<any> {
    try {
      return await this.bucketModel.updateMany(
        {_id: {$in: bucketIds}},
        {
          $set: {status},
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async addPaymentsToGeneralBucket(bucketId: string, products: any) {
    try {
      let total = 0
      let productWithPrices: Array<{product: string | ProductModelInterface; quantity: number; price?: number}> = [];
      for (const product of products) {
        total += product.product.packagePrice * product.quantity
        productWithPrices.push({
          product: product.product._id,
          price: product.product.packagePrice,
          quantity: product.quantity
        })
      }

      const paymentBucket = await this.paymentBucketService.create({
        total,
        bucket: bucketId,
        type: PaymentTypeEnum.CASH_ON_DELIVERY,
        status: PaymentBucketStatusEnum.PENDING
      })

      await this.bucketModel.findOneAndUpdate(
        {_id: bucketId.toString()},
        {
          $set: {products: productWithPrices, paymentBucket: paymentBucket['_id']},
        },
        {new: true}).lean();


    } catch (e) {
      console.error(e);
    }
  }

  async addPaymentsToPrescriptionBucket(bucketId: string, priceList: PriceList[]) {
    try {
      let total = 0
      for (const prescription of priceList) {
        total += prescription.total
      }

      const paymentBucket = await this.paymentBucketService.create({
        total,
        bucket: bucketId,
        type: PaymentTypeEnum.CASH_ON_DELIVERY,
        status: PaymentBucketStatusEnum.PENDING
      })

      await this.bucketModel.findOneAndUpdate(
        {_id: bucketId.toString()},
        {
          $set: {paymentBucket: paymentBucket['_id'], prescriptions: priceList},
        },
        {new: true}).lean();

    } catch (e) {
      console.error(e);
    }
  }

  async mergeBuckets(bucket: BucketModelInterface, bucketFound: BucketModelInterface) {
    try {
      bucketFound.products = [...bucket.products, ...bucketFound.products]
      const updatedBucket = await this.bucketModel.findByIdAndUpdate(
        {_id: bucketFound['_id'].toString()},
        {bucketFound},
        {new: true})
      return updatedBucket
    } catch (e) {
      console.log(e)
    }
  }

  async addRiderRatingToBucket(bucketId: string, ratingObject: Review): Promise<BucketModelInterface> {
    const {rating, feedback} = ratingObject
    try {
      const bucket = await this.getCustomPopulatedBucketByObject({_id: bucketId}, "")
      if (_.isEmpty(bucket))
        throw new UnprocessableEntityException('bucket not found')
      return this.update({_id: bucketId}, {$set: {riderRating: rating, riderFeedback: feedback}}, {new: true})
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async addRatingToBucket(bucketId: string, ratingObject: Review): Promise<BucketModelInterface> {
    const {rating, feedback} = ratingObject
    try {
      const bucket = await this.getCustomPopulatedBucketByObject({_id: bucketId}, "")
      if (_.isEmpty(bucket))
        throw new UnprocessableEntityException('bucket not found')
      return this.update({_id: bucketId}, {$set: {rating, feedback}}, {new: true})
    } catch (e) {
      console.log(e)
      throw e
    }
  }
}