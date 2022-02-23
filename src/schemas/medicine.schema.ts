import * as mongoose from 'mongoose';
import {Measurement} from './interfaces/medicine.interface';

export interface MedicineModelInterface {
  packageName: string;
  drugCode: string;
  salts: string[];
  insurancePlan: string;
  strength?: Measurement;
  strength_raw: string;
  dosageForm: string;
  unitPrice: number; // AED
  manufacturer: string;
  dispenseModes: string[];
  packagePrice: number; // AED
}

export interface MedicineModelStructure extends mongoose.Document, MedicineModelInterface {
}

const MeasurementSchema = new mongoose.Schema({
  key: {type: String, required: true}, // like, volume, mass etc
  value: {type: Number, required: true}, // 500
  unit: {type: String, required: true}, // ml
}, {_id: false, timestamps: false});

export const MedicineSchema = new mongoose.Schema({
  packageName: {type: String, required: true}, // package name
  drugCode: {type: String, required: true}, // unique code by health authority
  insurancePlan: {type: [String], required: true, default: ''},
  salts: {type: [String], required: true, default: ''}, // generic package name
  strength: {type: [MeasurementSchema], required: false},
  strength_raw: {type: String, required: true}, // raw format like 225mg/5ml, 200mg/5ml
  dosageForm: {type: String, required: true},
  unitPrice: {type: Number, required: true}, // AED
  packagePrice: {type: Number, required: false}, // AED
  manufacturer: {type: String, required: true}, // pharma company name
  dispenseModes: {type: [String], required: true},
})