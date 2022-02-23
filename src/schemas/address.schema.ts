import * as mongoose from 'mongoose';
import {AddressType} from '../common/enum.common';

export interface AddressModelInterface {
  addressName: string;
  streetAddress?: string;
  poBoxNumber?: string;
  emirates?: string;
  country?: string;
  addressType?: AddressType;
  location?: PointModelStructure;
  additionalInformation?: string;
}

export interface AddressModelStructure extends mongoose.Document, AddressModelInterface {
}

export interface PointModelStructure extends mongoose.Document {
  type?: any;
  coordinates: number[];
}

// to store GEO JSON
export const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

export const AddressSchema = new mongoose.Schema({
  // _id: { type: String },
  addressName: {type: String, default: ''},
  streetAddress: {type: String, default: ''},
  poBoxNumber: {type: String, default: ''},
  emirates: {type: String, default: ''}, //ABU ZABY (ABU DHABI),AJMAN,AL FUJAYRAH,ASH SHARIQAH,DUBAYY (DUBAI),RA’S AL KHAYMAH,UMM AL QAYWAYN,
  country: String,
  addressType: {
    type: String,
    enum: Object.values(AddressType),
    default: AddressType.Home,
  },
  location: {
    type: pointSchema,
    required: true,
  },
  additionalInformation: {
    type: String, required: false
  }
}, {_id: true});

// AddressSchema.createIndex({ location: '2dsphere' });
// export const AddressModel = mongoose.model<AddressModelStructure>('Address', AddressSchema, Collection.Address, true);
