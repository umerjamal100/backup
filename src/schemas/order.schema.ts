import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {AddressModelInterface, AddressSchema} from './address.schema';
import {BucketModelInterface} from './bucket.schema';
import {OrderStatusEnum} from "../order/types/enums/order.enum";
import {nanoid} from 'nanoid'
import {findInRangeDateAggregatedHourly} from "../admin/order/entities/aggregations/findInRangeDateAggregatedHourly";
import {findOrderCardsInDateRange} from "../admin/order/entities/aggregations/findOrderCardsInDateRange";
import {findInDateRangeAndGroupByField} from "../admin/order/entities/aggregations/findInDateRangeAndGroupByField";
import {OrderChatModelInterface} from "./adminChatSchema";

export interface OrderModelInterface {
  // patient: string;
  orderPlacedBy: string;
  buckets: string[] | BucketModelInterface[];
  allBuckets: string[] | BucketModelInterface[];
  cancelledBuckets?: string[] | BucketModelInterface[];
  notifiedBuckets?: string[] | BucketModelInterface[];
  to: AddressModelInterface,
  payment?: string;
  pendingPharmacyConfirmBucket: string[] | BucketModelInterface[];
  deliveredBuckets?: string[] | BucketModelInterface[];
  unratedBuckets?: string[] | BucketModelInterface[];
  status: OrderStatusEnum;
  total?: number;
  rating?: number;
  feedback?: string;
  adminOrderChat?: string | OrderChatModelInterface
}

export interface OrderModelStructure extends mongoose.Document, OrderModelInterface {
}

export const OrderSchema = new mongoose.Schema({
  // patient: { type: mongoose.Schema.Types.ObjectId, required: true }, // for family member or self
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  orderPlacedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // or by admin
  pendingPharmacyConfirmBucket: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: true},
  deliveredBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false},
  unratedBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false, default: []},
  status: {type: OrderStatusEnum, required: true, default: OrderStatusEnum.RUNNING},
  buckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: true},
  allBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false},
  cancelledBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false},
  notifiedBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false, default: []},
  to: {type: AddressSchema, required: true},
  // cancelledOrder: {type: mongoose.Schema.ObjectId, ref: 'Order'},
  payment: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Payment'}, //
  total: {type: Number, required: false, default: 0},
  rating: {type: Number, required: false, default: 0},
  feedback: {type: String, required: false},
  adminOrderChat: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'AdminChat'},
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

export interface OrderModel extends Model<OrderModelStructure> {
  findInDateRangeAndGroupByField: (field: string, to: string, from: string) => any;
  findInDateRangeAndAggregatedHourly: (to: string, from: string) => any;
  findOrderCardsInDateRange: (to: string, from: string) => any;
}


OrderSchema.statics.findInDateRangeAndGroupByField = async function (
  status: string,
  to: string,
  from: string,
) {
  return this.aggregate(findInDateRangeAndGroupByField('status', to, from));
};

OrderSchema.statics.findInDateRangeAndAggregatedHourly = async function (
  to: string,
  from: string,
) {
  return this.aggregate(findInRangeDateAggregatedHourly(to, from));
};

OrderSchema.statics.findOrderCardsInDateRange = async function (
  to: string,
  from: string,
) {
  return this.aggregate(findOrderCardsInDateRange(to, from))
};



