// TODO add patient and other user login details here instead of user table
import * as mongoose from 'mongoose';
import {UserRole} from '../common/enum.common';
import {PharmacyModelInterface} from './pharmacy.schema';
import {User} from './interfaces/user.interface';

export interface LoginModelInterface {
  userName: string;
  password: string;
  role: UserRole
  user: string | PharmacyModelInterface | User;  // for mongoose population
  isVerified?: boolean,
  rating?: number;
  ratingCount?: number;
}

export interface LoginModelStructure extends LoginModelInterface, mongoose.Document {
}

export const LoginSchema = new mongoose.Schema({
  userName: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, enum: Object.keys(UserRole).map(k => UserRole[k])},
  user: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pharmacy'},  // dont use populate here, just make an extra query on the basis of role
  isVerified: {type: Boolean, required: true, default: false},
  rating: {type: Number, required: false, default: 0},
  ratingCount: {type: Number, required: false, default: 0},
});
