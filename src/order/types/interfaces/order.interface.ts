import {AddressModelInterface} from '../../../schemas/address.schema';

export interface SplitOrderInterface {
  products: Product2[];
  subtotal: number;
}

interface Product2 {
  product: Product;
  shipmentAddress: AddressModelInterface;
  quantity: number;
  productId: string;
}


interface Location {
  coordinates: number[];
  _id: string;
  type: string;
}

interface Product {
  _id: string;
  insurancePlan: string[];
  salts: string[];
  dispenseModes: string[];
  symptoms: string[];
  drugCode: string;
  packageName: string;
  strength_raw: string;
  dosageForm: string;
  unitPrice: number;
  packagePrice: number;
  manufacturer: string;
  pharmacy: string;
  pharmacyId: string;
  strength: any[];
  __v: number;
}

interface PharmacyId {
  _id: string;
  logo: string;
  contact: string;
  domain: string;
  name: string;
  __v: number;
}

export interface SubOrderMap {
  internalId: string;
  pharmacyId: string;
  productId: string;
  quantity: number;
  distance: number;
}

export interface SplitOrdersInterface {
  [x: string]: SubOrderMap[] | string;
}

export interface SubOrderInterface {
  [p: string]: {prods: SubOrderMap[] | string; subOrderId: string}
}

export interface PharmaciesCacheInterface {
  pharmacyId: string;
  distance: string;
  visited: boolean;
}

export interface DistanceETAEstimation {
  distance: string,
  eta: string
}

export interface Review {
  rating: number;
  feedback: string;
}


export interface UnRatedBucket {
  _id: string;
  aliasId: string;
}

export interface Datum {
  _id: string;
  aliasId: string;
  unRatedBuckets: UnRatedBucket[];
}

export interface UnRatedOrdersResponse {
  data: Datum[];
}

