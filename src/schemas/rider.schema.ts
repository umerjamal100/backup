import * as mongoose from 'mongoose';
import {UserRole} from '../common/enum.common';
import {AddressSchema, PointModelStructure, pointSchema} from './address.schema';
import {RiderStateEnum} from "../rider/types/enums/rider.enum";
import {nanoid} from "nanoid";

export interface RiderAggregatedProps {
  rating: number;
  avgTime: number;
  deliveredOrders: number;
  rejectedOrders: number;
  forwardedOrders: number;
  performance: number;
  totalRevenue: number;
}

export interface RiderModelInterface {
  name?: string;
  role: UserRole;
  state?: string;
  isOnline: boolean;
  currentLocation?: PointModelStructure;
  phone?: string;
  email?: string;
  password?: string;
  rating?: number;
  ratingCount?: number;
  aggregatedProps: RiderAggregatedProps;
}

export interface PartialRiderModelInterface {
  name?: string;
  role?: UserRole;
  state?: string;
  isOnline?: boolean;
  currentLocation?: PointModelStructure;
  phone?: string;
  email?: string;
  password?: string;
  rating?: number;
  ratingCount?: number;
  aggregatedProps?: RiderAggregatedProps;
}

export interface RiderModelStructure extends RiderModelInterface, mongoose.Document {
}

export const RiderAggregatedPropSchema = new mongoose.Schema({
  tRating: {type: Number, default: 0},
  tRatingCount: {type: Number, default: 0},
  totalDeliveryTime: {type: Number, default: 0},
  deliveryTimeCount: {type: Number, default: 0},
  deliveredOrders: {type: Number, default: 0},
  rejectedOrders: {type: Number, default: 0},
  forwardedOrders: {type: Number, default: 0}, //hand-off
  performance: {type: Number, default: 0},
  totalRevenue: {type: Number, default: 0},
}, {_id: false});

export const RiderSchema = new mongoose.Schema({
  name: {type: String, required: false},
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  role: {type: String, enum: Object.keys(UserRole).map((k) => UserRole[k])},
  state: {type: String, enum: Object.keys(RiderStateEnum).map((k) => RiderStateEnum[k]), default: RiderStateEnum.FREE},
  address: {type: AddressSchema, required: false},
  currentLocation: {
    type: pointSchema,
    required: false,
  },
  phone: {type: String, required: false},
  email: {type: String, required: false},
  password: {type: String, required: false},
  isOnline: {type: Boolean, required: false, default: false},
  rating: {type: Number, required: false, default: 0},
  ratingCount: {type: Number, required: false, default: 0},
  aggregatedProps: {type: RiderAggregatedPropSchema, required: false, default: {}},
});
RiderSchema.index({currentLocation: '2dsphere'});