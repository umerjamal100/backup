import * as mongoose from 'mongoose';
import {PharmacyModelStructure} from './pharmacy.schema';
import {MedicineModelStructure} from './medicine.schema';

export interface MedicinePharmacyModelStructure extends mongoose.Document {
  medicine: string | MedicineModelStructure; // for mongoose population
  pharmacy: string | PharmacyModelStructure;
}

export const MedicinePharmacySchema = new mongoose.Schema({
  medicine: {type: String, required: true, ref: 'Medicine'},
  pharmacy: {type: String, required: true, ref: 'Pharmacy'},
})