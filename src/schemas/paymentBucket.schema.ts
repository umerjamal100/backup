import * as mongoose from 'mongoose';
import {PaymentBucketStatusEnum, PaymentTypeEnum} from "../order/types/enums/paymentBucket.enum";

export interface PaymentBucketModelInterface {
  type: PaymentTypeEnum;
  status: PaymentBucketStatusEnum;
  bucket: string;
  total: number;
}

export interface PaymentBucketModelStructure extends mongoose.Document, PaymentBucketModelInterface {
}

export const PaymentBucketSchema = new mongoose.Schema({
  type: {type: PaymentTypeEnum, required: true, default: PaymentTypeEnum.CASH_ON_DELIVERY},
  status: {type: PaymentBucketStatusEnum, required: true, default: PaymentBucketStatusEnum.PENDING},
  bucket: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bucket'},
  total: {type: Number, required: true, default: 0}
});