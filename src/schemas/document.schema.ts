import * as mongoose from 'mongoose';
import {Nullable} from './interfaces/relationship.interface';
import {FamilyModelStructure, FamilySchema} from './family.schema';
import {PrescriptionModelStructure, PrescriptionSchema} from './prescription.schema';

export interface DocumentsModelStructure extends mongoose.Document {
  profilePic: string;
  relationships: Nullable<FamilyModelStructure>[];
  prescriptions: Nullable<PrescriptionModelStructure>[];
  emiratesIdPic: string[];
  healthCardPic: string[];
  user: string;
}


/**
 * fan out all documents on insertion into respective fields
 * document of siblings(relation ship) will be identified on emirates Id
 */
export const DocumentsSchema = new mongoose.Schema({
  profilePic: {type: String, required: true},
  relations: {type: [FamilySchema], required: true},
  prescriptions: {type: [PrescriptionSchema], required: true},
  emiratesIdPic: {type: [String], required: true, default: ''},
  healthCardPic: {type: [String], required: true, default: ''},
  user: {type: String, required: true, default: ''}, // store bucket name in constants
}, {timestamps: true});