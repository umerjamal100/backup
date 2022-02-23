import * as mongoose from 'mongoose';
import {UrlSchema, UrlSchemaModelInterface} from "./prescription.schema";

export interface FamilyModelInterface {
  _id?: any;
  firstName: string;
  lastName: string;
  emiratesId: string;
  profilePic: UrlSchemaModelInterface;
  emiratesIdPic: UrlSchemaModelInterface;
  relationship: string;
  healthCardPic?: UrlSchemaModelInterface;
}

export interface FamilyModelStructure extends mongoose.Document, Omit<FamilyModelInterface, '_id'> {
}

export const FamilySchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  emiratesId: {type: String, required: true},
  profilePic: {type: UrlSchema, required: true},
  healthCardPic: {type: UrlSchema, required: true},
  emiratesIdPic: {type: UrlSchema, required: true}, // store bucket name in constants
  relationship: {type: String, enum: ['BROTHER', 'SISTER', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER']},
}, {timestamps: false})