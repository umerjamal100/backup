import {AddressDto} from '../../../users/types/dto/user.dto';
import {PrescriptionSubDto, ProductSubDto} from '../dto/cart.dto';

export interface CreateCartInterface {
  shipmentAddress: AddressDto;
  prescriptions: PrescriptionSubDto[];
  user: any;
  products: ProductSubDto[]
}

/**
 * when cart is submitted the front end gets this response
 * converting the response json to ts using online tool
 */
export interface Location {
  coordinates: number[];
  _id: string;
  type: string;
}

export interface Address {
  addressName: string;
  streetAddress: string;
  poBoxNumber: string;
  emirates: string;
  addressType: string;
  country: string;
  location: Location;
}

export interface Pharmacy {
  logo: string;
  contact: string;
  isOnline: boolean;
  _id: string;
  address: Address;
  domain: string;
  name: string;
  __v: number;
}

export interface Product2 {
  insurancePlan: string[];
  salts: string[];
  dispenseModes: string[];
  symptoms: string[];
  _id: string;
  drugCode: string;
  packageName: string;
  strength_raw: string;
  dosageForm: string;
  unitPrice: number;
  packagePrice: number;
  manufacturer: string;
  packageSize: string;
  pharmacy: string;
  pharmacyId: string;
  internalId: string;
  category: string;
  productType: string;
  strength: any[];
  __v: number;
}

export interface Product {
  product: Product2;
  quantity: number;
}

export interface Bucket {
  status: string;
  requestedRiders: any[];
  _id: string;
  orderId: string;
  cart: string;
  pharmacy: Pharmacy;
  products: Product[];
  userId: string;
  __v: number;
}

export interface CartCheckoutInterface {
  orderId: string;
  buckets: Bucket[];
}


