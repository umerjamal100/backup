import * as mongoose from "mongoose";
import {BucketModelInterface} from "./bucket.schema";
import {nanoid} from "nanoid";
import {UserRole} from "../common/enum.common";
import {AdminModelInterface, SubAdminModelInterface} from "./admin.schema";
import {OrderModelInterface} from "./order.schema";
import {AdminChatStatus, PatientChatLevel} from "../admin-chat/types/enum";
import {UrlSchema, UrlSchemaModelInterface} from "./prescription.schema";
import {AdvertisementEnum} from "../promotions/types/enums/advertisement.enum";

export interface RequestPromotionModelInterface {
  aliasId?: string;
  role: UserRole;
  user: string;
  advertisement: string;
}

export interface RequestAdvertisementModelInterface extends RequestPromotionModelInterface {
  status: string,
  startDate: string,
  endDate: string,
}

export interface RequestAdvertisementModelStructure extends mongoose.Document, RequestAdvertisementModelInterface {
}

export const RequestAdvertisementSchema = new mongoose.Schema({
  status: {type: String, enum: Object.keys(AdvertisementEnum), required: true, default: AdvertisementEnum.REQUESTED},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
})

export const RequestPromotionSchema = new mongoose.Schema({
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  role: {type: UserRole, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, required: true},
  advertisement: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Promotion'},
}, {timestamps: true, discriminatorKey: 'type'});