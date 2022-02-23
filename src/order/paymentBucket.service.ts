import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {PaymentBucketModelInterface, PaymentBucketModelStructure} from "../schemas/paymentBucket.schema";
import {PaymentBucketStatusEnum, PaymentTypeEnum} from "./types/enums/paymentBucket.enum";

@Injectable()
export class PaymentBucketService {
  constructor(
    @InjectModel('PaymentBucket')
    private readonly paymentBucketModel: Model<PaymentBucketModelStructure>,
  ) {
  }

  async create(paymentBucket: PaymentBucketModelInterface): Promise<PaymentBucketModelInterface> {
    try {
      return (await this.paymentBucketModel.create(paymentBucket)).toObject();
    } catch (e) {
      console.error(e);
    }

  }

  async findOneAndUpdate(bucket: string, obj: any): Promise<PaymentBucketModelInterface> {
    try {
      return this.paymentBucketModel.findOneAndUpdate(
        {bucket},
        {
          $set: obj,
        },
        {new: true});
    } catch (e) {
      console.log(e)
    }
  }

  async updateBucketPaymentTypeCreditDebit(bucketIds: string[]) {
    try {
      await this.paymentBucketModel.updateMany(
        {bucket: {$in: bucketIds}},
        {
          $set: {status: PaymentBucketStatusEnum.PAID, type: PaymentTypeEnum.CREDIT_DEBIT},
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async updateBucketPaymentTypeCashOnDelivery(bucketIds: string[]) {
    try {
      await this.paymentBucketModel.updateMany(
        {bucket: {$in: bucketIds}},
        {
          $set: {type: PaymentTypeEnum.CASH_ON_DELIVERY},
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async updatePaymentBucketsStatus(bucketIds: string[], status: PaymentBucketStatusEnum) {
    try {
      return await this.paymentBucketModel.updateMany(
        {bucket: {$in: bucketIds}},
        {
          $set: {status},
        },
        {new: true}).lean();
    } catch (e) {
      console.error(e);
    }
  }
}