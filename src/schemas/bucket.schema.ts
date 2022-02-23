/**
 * bucket holds pending orders
 * pending orders means pharmacies haven't taken any actions (neither accepted nor timed out)
 */

import * as mongoose from 'mongoose';
import {Model, Types} from 'mongoose';
import {PharmacyModelInterface} from './pharmacy.schema';
import {ProductModelInterface} from './product.schema';
import {PrescriptionModelInterface, UrlSchema, UrlSchemaModelInterface} from './prescription.schema';
import {CartModelInterface} from './cart.schema';
import {BucketStatusEnum, BucketType, ProceedWithoutBucketEnum} from '../order/types/enums/order.enum';
import {PaymentBucketModelInterface} from "./paymentBucket.schema";
import {RiderBucketModelInterface} from "./riderBucket.schema";
import {OrderModelInterface} from "./order.schema";
import {nanoid} from "nanoid";
import {RiderModelInterface} from "./rider.schema";
import {PharmacyAcceptIssues} from "../pharmacy/types/enums/pharmacy.enum";
import {findBucketCardsInDateRange} from "../admin/order/entities/aggregations/findBucketCardsInDateRange";
import {ChatBucketModelInterface} from "./chatBucket.schema";
import {OrderChatModelInterface, PharmacyOrderChatModelInterface} from "./adminChatSchema";

export interface BucketModelInterface {
  prescriptions?: Array<PrescriptionPriceModelInterface>;
  type: BucketType;
  products?: Array<{product: string | ProductModelInterface; quantity: number}>;
  pharmacy: string | PharmacyModelInterface;
  status: BucketStatusEnum;
  cart: string | CartModelInterface;
  total: number;
  orderId: string | OrderModelInterface;
  userId: string;
  riderId?: string | RiderModelInterface
  requestedRiders?: string[] | BucketModelInterface[];
  paymentBucket?: Types.ObjectId | PaymentBucketModelInterface;
  riderBucket?: string | RiderBucketModelInterface,
  chatBucket?: string | ChatBucketModelInterface,
  timeStamp?: TimeStampInterface;
  patientDistance?: string;
  patientEta?: string;
  estTotal?: number;
  reasons?: ProceedWithoutBucketEnum[],
  issues?: IssuesInterface[],
  videos?: VideoInterface[],
  comments?: CommentInterface[]
  rating?: number;
  riderRating?: number;
  feedback?: string;
  riderFeedback?: string;
  adminOrderChat?: string | OrderChatModelInterface
  adminPharmacyOrderChat?: string | PharmacyOrderChatModelInterface;
}

export interface PartialBucketModelInterface {
  bucketId?: string;
  prescriptions?: Array<PrescriptionPriceModelInterface>;
  type?: BucketType;
  products?: Array<{product: string | ProductModelInterface; quantity: number; price?: number}>;
  pharmacy?: string | PharmacyModelInterface;
  status?: BucketStatusEnum;
  cart?: string | CartModelInterface;
  orderId?: string;
  userId?: string;
  riderId?: string
  requestedRiders?: string[] | BucketModelInterface[];
  priceList?: Map<String, String>,
  paymentBucket?: Types.ObjectId | PaymentBucketModelInterface
  riderBucket?: string,
  chatBucket?: string | ChatBucketModelInterface,
  timeStamp?: TimeStampInterface;
  patientDistance?: string;
  patientEta?: string;
  estTotal?: number;
  reasons?: ProceedWithoutBucketEnum[],
  issues?: IssuesInterface[],
  videos?: VideoInterface[],
  comments?: CommentInterface[],
  rating?: number;
  riderRating?: number;
  feedback?: string;
  riderFeedback?: string;
  adminOrderChat?: string | OrderChatModelInterface
  adminPharmacyOrderChat?: string | PharmacyOrderChatModelInterface;
}

export interface VideoInterface extends UrlSchemaModelInterface {
  prescriptionId: string
}

export interface IssuesInterface {
  issue: PharmacyAcceptIssues[];
  prescriptionId: string
}

export interface CommentInterface {
  comment: string;
  prescriptionId: string
}

export interface TimeStampInterface {
  startTime: string,
  expireTime: string,
  TimeConstant: number
}

export interface PrescriptionPriceModelInterface {
  prescriptionId: string | PrescriptionModelInterface,
  subTotal?: number,
  discount?: number,
  total?: number
}

export const TimeStampSchema = new mongoose.Schema({
  startTime: String,
  expireTime: String,
  TimeConstant: Number
}, {_id: false})

export interface BucketExtendedModel extends BucketModelInterface {
  _id: string
}

export interface BucketModelStructure extends mongoose.Document, BucketModelInterface {
}

const ProductSchema = new mongoose.Schema({
  product: {type: Types.ObjectId, required: true, ref: 'Product'},
  quantity: {type: Number, required: true},
  price: {type: Number, required: false}
}, {_id: false, timestamps: false});

const PrescriptionPriceSchema = new mongoose.Schema({
  prescriptionId: {type: Types.ObjectId, required: true, ref: 'Prescription'},
  subTotal: {type: Number, required: false},
  discount: {type: Number, required: false},
  total: {type: Number, required: false},
}, {_id: false, timestamps: false});

const CommentSchema = new mongoose.Schema({
  prescriptionId: {type: Types.ObjectId, required: true, ref: 'Prescription'},
  comment: {type: String, required: true}
}, {_id: false, timestamps: false});

const IssuesSchema = new mongoose.Schema({
  prescriptionId: {type: Types.ObjectId, required: true, ref: 'Prescription'},
  issue: {type: [String], required: true}
}, {_id: false, timestamps: false});

const VideoSchema = new mongoose.Schema({
  prescriptionId: {type: Types.ObjectId, required: true, ref: 'Prescription'},
}, {_id: false, timestamps: false}).add(UrlSchema);

export const BucketSchema = new mongoose.Schema({
  prescriptions: {type: [PrescriptionPriceSchema], required: false},
  type: {type: String, enum: Object.keys(BucketType).map(k => BucketType[k]), required: true},
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  products: {type: [ProductSchema], required: false},
  pharmacy: {type: Types.ObjectId, required: true, ref: 'Pharmacy'},
  cart: {type: Types.ObjectId, required: true, ref: 'Cart'},
  status: {
    type: String,
    enum: Object.keys(BucketStatusEnum).map(k => BucketStatusEnum[k]),
    required: true,
    default: BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION,
  },
  orderId: {type: String, required: false, ref: 'Order'},
  userId: {type: String, required: false, ref: 'User'},
  riderId: {type: String, required: false, ref: 'Rider'},
  requestedRiders: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Rider'}], required: false},
  paymentBucket: {type: mongoose.Schema.Types.ObjectId, ref: 'PaymentBucket', required: false},
  riderBucket: {type: mongoose.Schema.Types.ObjectId, ref: 'RiderBucket', required: false},
  chatBucket: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatBucket', required: false},
  timeStamp: {type: TimeStampSchema, required: false},
  patientDistance: {type: String, required: false},
  patientEta: {type: String, required: false},
  estTotal: {type: Number, required: false, default: 0},
  reasons: {type: [String], required: false},
  issues: {type: [IssuesSchema], required: false},
  videos: {type: [VideoSchema], required: false},
  comments: {type: [CommentSchema], required: false},
  rating: {type: Number, required: false, default: 0},
  riderRating: {type: Number, required: false, default: 0},
  feedback: {type: String, required: false},
  riderFeedback: {type: String, required: false},
  adminOrderChat: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'AdminChat'},
  adminPharmacyOrderChat: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'AdminChat'}
}, {timestamps: true});

export interface BucketModel extends Model<BucketModelStructure> {
  findBucketCardsInDateRange: (to: string, from: string) => any;
}

BucketSchema.statics.findBucketCardsInDateRange = async function (
  to: string,
  from: string,
) {
  return this.aggregate(findBucketCardsInDateRange(to, from))
};