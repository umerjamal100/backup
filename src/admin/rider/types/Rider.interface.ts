export interface Location {
  coordinates: number[];
  _id: string;
  type: string;
}

export interface OrderTableInterface {
  _id: string;
  pendingPharmacyConfirmBucket: any[];
  deliveredBuckets: string[];
  status: string;
  buckets: string[];
  total: number;
  to?: any;
  orderPlacedBy: string;
  aliasId: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  addressName: string;
  streetAddress: string;
  poBoxNumber: string;
  emirates: string;
  addressType: string;
  country: string;
  location: Location;
}
