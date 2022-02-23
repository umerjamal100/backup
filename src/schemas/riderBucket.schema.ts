import * as mongoose from 'mongoose';
import {RiderBucketEnum} from "../order/types/enums/order.enum";
import {BucketModelInterface, TimeStampInterface, TimeStampSchema} from "./bucket.schema";
import {PharmacyModelInterface} from "./pharmacy.schema";
import {nanoid} from "nanoid";

export interface RiderBucketModelInterface {
  originBucket: string | BucketModelInterface,
  buckets: string[] | BucketModelInterface[];
  pharmacy: string | PharmacyModelInterface,
  rider: string,
  pharmacyEta?: string,
  patientEta?: string,
  pharmacyDistance?: string
  patientDistance?: string
  shipmentAddresses?: IdentityPointModelStructure[],
  reason?: any[],
  status?: RiderBucketEnum
  deliveredBuckets?: string[] | BucketModelInterface[];
  runningBucket?: string | BucketModelInterface;
  riderTimeStamp?: TimeStampInterface;
}

export interface PartialRiderBucketModelInterface {
  originBucket?: string,
  buckets?: string[] | BucketModelInterface[];
  rider?: string,
  pharmacyEta?: string,
  pharmacy?: string | PharmacyModelInterface,
  patientEta?: string,
  pharmacyDistance?: string
  patientDistance?: string
  shipmentAddresses?: IdentityPointModelStructure[],
  reason?: any[],
  status?: RiderBucketEnum
  deliveredBuckets?: string[] | BucketModelInterface[];
  runningBucket?: string | BucketModelInterface;
  riderTimeStamp?: TimeStampInterface;
}

export interface IdentityPointModelStructure extends mongoose.Document {
  type?: any;
  coordinates: number[];
  bucket: string;
}

export interface RiderBucketModelStructure extends mongoose.Document, RiderBucketModelInterface {
}

export const identityPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  bucket: {type: mongoose.Types.ObjectId, required: true}
});

export const RiderBucketSchema = new mongoose.Schema({
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  buckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: true},
  deliveredBuckets: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bucket'}], required: false},
  rider: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Rider'},
  shipmentAddresses: {type: [{type: identityPointSchema, required: true}], required: false},
  pharmacy: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pharmacy'},
  originBucket: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bucket'},
  runningBucket: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Bucket'},
  pharmacyEta: {type: String, required: false},
  patientEta: {type: String, required: false},
  pharmacyDistance: {type: String, required: false},
  patientDistance: {type: String, required: false},
  reason: {type: Array, required: false},
  status: {type: RiderBucketEnum, required: true, default: RiderBucketEnum.PENDING},
  riderTimeStamp: {type: TimeStampSchema, required: false},
});
RiderBucketSchema.index({'shipmentAddresses.coordinates': '2dsphere'});
