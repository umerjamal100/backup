import {MimeTypes} from './enum.common';
import {BucketStatusEnum} from "../order/types/enums/order.enum";

export const enum nodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  LOCAL = 'local',
  STAGING = 'staging',
  TEST = 'test',
  PROVISION = 'provision',
  INSPECTION = 'inspection'
}

export const sessionName = 'hpromevitaerc';

export const mimeTypesArray: string[] = Object.keys(MimeTypes).map((key) => MimeTypes[key]);

export const OTPEmailSender = 'moazzam.arif.exp@gmail.com';

export const OTPTimeout = 3600;

export const systemName = 'deepDive';

export enum MICRO_SERVICE_INJECTION_TOKEN {
  ELASTIC_SEARCH = 'Elasticsearch_Service',
  MONGO_MONITOR = 'Mongo_OP_Log_Monitor_Service',
  ORDER = 'Order_Receive'
}


export const MESSAGE_PATTERNS = {
  SYNC_PRODUCTS: 'sync: products',
  AUTO_COMPLTEE_SUGGESTIONS: 'auto complete suggestion',
  KEYWORD_SEARCH: 'keyword search',
  CHECKOUT_CART: 'checkout_cart'
}

export const REMOVE_BUCKETS_STATUSES = [
  BucketStatusEnum.WAITING_FOR_USER_PAYMENT_CONFIRMATION,
  BucketStatusEnum.PHARMACY_CONFIRMED
]

export const IN_TRANSIT_BUCKETS = [
  BucketStatusEnum.RIDER_CONFIRMED,
  BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY,
  BucketStatusEnum.RIDER_COLLECTING_THE_ORDER_FROM_PHARMACY,
  BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY,
  BucketStatusEnum.RIDER_ON_THE_WAY_TO_USER,
  BucketStatusEnum.RIDER_ARRIVED_TO_USER,
  BucketStatusEnum.RIDER_WAITING_FOR_USER,
  BucketStatusEnum.USER_CAME_TO_RIDER_TO_PICK_ORDER,
  BucketStatusEnum.RIDER_ASK_FOR_PAYMENT,
]