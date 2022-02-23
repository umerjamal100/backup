import * as mongoose from 'mongoose';
import {AddressModelStructure, AddressSchema} from './address.schema';

export interface PharmacyAggregatedProps {
  arrivedOrders: number;
  rejectedOrders: number;
  waitingOnPaymentOrders: number;
  numberOfProducts: number;
  promotions: number;
  revenue: number;
}

export interface PharmacyModelInterface {
  name: string;
  domain: string;
  address: AddressModelStructure;
  logo: string;
  contact: string;
  isOnline: boolean;
  rating?: number;
  ratingCount?: number;
  aggregatedProps: PharmacyAggregatedProps;
}

export interface PharmacyModelStructure extends PharmacyModelInterface, mongoose.Document {
}

export const PharmacyAggregatedPropSchema = new mongoose.Schema({
  arrivedOrders: {type: Number, default: 0},
  rejectedOrders: {type: Number, default: 0},
  waitingOnPaymentOrders: {type: Number, default: 0},
  numberOfProducts: {type: Number, default: 0},
  promotions: {type: Number, default: 0},
  revenue: {type: Number, default: 0}
}, {_id: false});

export const PharmacySchema = new mongoose.Schema({
  name: {type: String, required: true},
  domain: {type: String, required: true},
  address: {type: AddressSchema, required: false},
  logo: {type: String, required: true, default: ''},
  contact: {type: String, required: true, default: ''},
  isOnline: {type: Boolean, required: false, default: false},
  rating: {type: Number, required: false, default: 0},
  ratingCount: {type: Number, required: false, default: 0},
  aggregatedProps: {type: PharmacyAggregatedPropSchema, required: false, default: {}},

});

PharmacySchema.index({'address.location': '2dsphere'});