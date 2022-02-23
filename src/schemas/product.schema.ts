import * as mongoose from 'mongoose';
import {Measurement} from './interfaces/medicine.interface';
import {ConfigService} from '../config/config.service';
import {PharmacyModelInterface} from './pharmacy.schema';
import {ProductType} from "./interfaces/products.interface";
import {Model} from "mongoose";
import {OrderModelStructure} from "./order.schema";

export interface ProductModelInterface {
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
  packageSize: string;
  symptoms: string[];
  pharmacy: string | PharmacyModelInterface;
  pharmacyId: string | PharmacyModelInterface;
  internalId: string;
  category: string;
  productType: string;
  getProductPrice?: ()=> {}
}

export interface ProductModelStructure extends mongoose.Document, ProductModelInterface {
}


const MeasurementSchema = new mongoose.Schema({
  key: {type: String, required: true, es_type: 'text'}, // like, volume, mass etc
  value: {type: Number, required: true, es_type: 'integer'}, // 500
  unit: {type: String, required: true, es_type: 'text'}, // ml
}, {_id: false, timestamps: false});


// const SymptomSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// }, { timestamps: 0, _id: 0 });

export const ProductSchemaProvider = (configService: ConfigService) => {
  const ProductSchema = new mongoose.Schema({
    packageName: {
      type: String,
      required: true,
      es_indexed: true,
      es_type: 'completion',
      es_index_analyzer: 'simple',
      es_search_analyzer: 'simple',
      es_payloads: true,

    },
    drugCode: {
      type: String,
      required: true,
      es_indexed: true,
    }, // unique code by health authority
    insurancePlan: {
      type: [String],
      required: true,
      default: '',
      es_indexed: true,
      es_type: 'text',
    },
    salts: {
      type: [String],
      required: false,
      default: '',
      es_indexed: true,
      es_type: 'completion',
      es_index_analyzer: 'simple',
      es_search_analyzer: 'simple',
      es_payloads: true,
    }, // generic package name
    strength: {type: [MeasurementSchema], required: false},
    strength_raw: {
      type: String,
      required: false,
      es_indexed: true,
      es_type: 'text',
    }, // raw format like 225mg/5ml, 200mg/5ml
    dosageForm: {
      type: String, required: false,
      es_indexed: true,
      es_type: 'text',
    },
    unitPrice: {type: Number, required: true, es_type: 'integer', es_indexed: true}, // AED
    packagePrice: {type: Number, required: false, es_type: 'integer', es_indexed: true}, // AED
    manufacturer: {type: String, required: true, es_type: 'text', es_indexed: true}, // pharma company name
    dispenseModes: {type: [String], required: false, es_type: 'text', es_indexed: true},
    symptoms: {
      type: [String], required: false,
      es_indexed: true,
      es_type: 'completion',
      es_index_analyzer: 'suggestions',
      es_search_analyzer: 'suggestions',
      es_payloads: true,
    },
    //this is pharmacyName
    pharmacy: {type: String, required: true},
    pharmacyId: {type: String, required: true, ref: 'Pharmacy'},
    internalId: {type: String, required: true},
    category: {type: String, required: false},
    packageSize: {type: String, required: false},
    productType: {type: String, required: false, enum: Object.keys(ProductType).map(k => ProductType[k])},
    discount: {type: Boolean, required: true, default: false},
    discountPercentage: {type: Number, required: true, default: 0},
  });

  // ProductSchema.index({'$**': 'text'});
  ProductSchema.index({_id: 1, packagePrice: 1})

  ProductSchema.methods.getProductPrice = async function (): Promise<number> {
    console.log(this.discount)
    return this.discount
  }

  return ProductSchema;
}




