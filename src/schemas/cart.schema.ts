import * as mongoose from 'mongoose';
import {AddressModelInterface, AddressSchema} from './address.schema';
import {ProductQuantityInterface} from "../product/types/interfaces/product.interface";
import {PrescriptionModelInterface} from "./prescription.schema";

export interface CartModelInterface {
  user: string;
  products: Array<ProductQuantityInterface>;
  prescriptions?: Array<{prescriptionId: string | PrescriptionModelInterface}>;
  shipmentAddress: AddressModelInterface,
  metaData: string;
  status?: string;
  total?: number;
}

export interface CartModelStructure extends mongoose.Document, CartModelInterface {
}

const ProductSubSchema = new mongoose.Schema({
  productId: {type: String, ref: 'Product'},
  quantity: {type: Number, default: 1, required: true},
}, {timestamps: false, _id: false});


const PrescriptionSubSchema = new mongoose.Schema({
  prescriptionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}
}, {timestamps: false, _id: false});

export const CartSchema = new mongoose.Schema({
  user: {type: String, required: true, ref: 'User'},
  products: {type: [ProductSubSchema], required: true, default: []},
  prescriptions: {type: [PrescriptionSubSchema], required: false, default: []},
  shipmentAddress: {type: AddressSchema, required: false},
  status: {type: String, enum: ['IN_PROGRESS', 'CONFIRMED', 'READY_FOR_PHARMACY'], default: 'IN_PROGRESS'},
  total: {type: Number, required: true, default: 0},
  metaData: {type: String, required: false}
}, {timestamps: true});

CartSchema.virtual('prod_details', {
  localField: 'products.productId',
  foreignField: '_id',
  ref: 'products',
  justOne: true,
});

