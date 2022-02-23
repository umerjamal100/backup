import {UserRole} from '../../common/enum.common';
import {AddressModelInterface} from '../address.schema';
import {FamilyModelInterface} from '../family.schema';
import * as mongoose from 'mongoose';
import {UrlSchemaModelInterface} from "../prescription.schema";
import {cardCode, ISOCountryCodes} from "../../users/types/enums/user.enum";

export interface IdpsInterface {
  provider?: string;
  userId?: string;
  refreshToken?: string;
  accessToken?: string;
}

export interface OriginalTransactionInterface {
  completeCode: string
  tranRef: string
  card: CardInterface
}

export interface CardInterface {
  Last4: string
  cardCode: cardCode
  country: ISOCountryCodes
  first6: string
  expiryMonth: string
  expiryYear: string
}

export interface User {
  _id?: any;
  emiratesId?: string;
  emiratesIdPic?: UrlSchemaModelInterface;
  healthCardIdPic?: UrlSchemaModelInterface;
  gender?: string;
  phone?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: UrlSchemaModelInterface;
  hospitalId?: string;
  pharmacyId?: string;
  role?: UserRole;
  addresses?: AddressModelInterface[];
  active?: boolean;
  deleted?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idps?: IdpsInterface[];
  relations?: FamilyModelInterface[];
  favorites?: string[]
  originalTransactions?: OriginalTransactionInterface[]
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface UserModelStructure extends mongoose.Document, User {
}

