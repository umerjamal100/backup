import * as mongoose from 'mongoose';
import {Error} from 'mongoose';
import {UserRole} from "../common/enum.common";
import {AddressModelInterface, AddressSchema} from "./address.schema";

export interface AdministrationModelInterface {
  emiratesId: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AdminModelInterface extends AdministrationModelInterface {
  test: string;
}

export interface SubAdminModelInterface extends AdministrationModelInterface {
  firstName: string;
  lastName: string;
  profilePic: string;
  active: boolean;
  deleted: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  addresses: AddressModelInterface;
  gender: string;
}

export interface AdminModelStructure extends mongoose.Document, AdminModelInterface {
}

export interface SubAdminModelStructure extends mongoose.Document, SubAdminModelInterface {
}

export const SubAdminSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  profilePic: {type: String, required: true, default: ''},
  active: {type: Boolean, default: false},
  deleted: {type: Boolean, default: false},
  phoneVerified: {type: Boolean, default: false},
  emailVerified: {type: Boolean, default: false},
  addresses: {type: [AddressSchema], default: [], required: true},
  gender: {type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true},
});

export const AdminSchema = new mongoose.Schema({test: String});

export const AdministrationSchema = new mongoose.Schema({
  emiratesId: {type: String, required: true, default: '', unique: true},
  phone: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {
    type: String,
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.Patient,
    validate: {
      validator: (v: string) => Object.values(UserRole).some(role => v === role),
      message: (props) => `${(props as Error.ValidatorError).value} is not a valid role.`,
    },
  },
}, {discriminatorKey: 'kind'});
