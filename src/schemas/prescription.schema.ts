import * as mongoose from 'mongoose';
import {BucketName, Buckets} from "../helpers/interfaces/aws.helper.interface";
import {User} from "./interfaces/user.interface";
import {FamilyModelInterface} from "./family.schema";

export interface PrescriptionModelInterface {
  urlBucket: UrlSchemaModelInterface[];
  user: string | User;
  relation?: string | FamilyModelInterface;
  healthCardApplied: boolean;
}

export interface UrlSchemaModelInterface {
  url: string,
  bucketName: Buckets
}

export interface PrescriptionModelStructure extends mongoose.Document, PrescriptionModelInterface {
}

export const UrlSchema = new mongoose.Schema({
  url: {type: String, required: true},
  bucketName: {type: String, enum: BucketName, required: true}
}, {timestamps: false, _id: false})

const FamilySchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  emiratesId: {type: String, required: true},
  profilePic: {type: UrlSchema, required: true},
  healthCardPic: {type: UrlSchema, required: true},
  emiratesIdPic: {type: UrlSchema, required: true}, // store bucket name in constants
  relationship: {type: String, enum: ['BROTHER', 'SISTER', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER']},
}, {timestamps: false})

/**
 *  relationship will be identified on emirates id
 */
export const PrescriptionSchema = new mongoose.Schema({
  urlBucket: {type: [UrlSchema], required: true},
  user: {type: String, required: true},
  relation: {type: FamilySchema, required: false},
  healthCardApplied: {type: Boolean, default: true},
}, {timestamps: true})