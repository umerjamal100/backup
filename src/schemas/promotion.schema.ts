import * as mongoose from "mongoose";
import {BucketModelInterface} from "./bucket.schema";
import {nanoid} from "nanoid";
import {UserRole} from "../common/enum.common";
import {AdminModelInterface, SubAdminModelInterface} from "./admin.schema";
import {OrderModelInterface} from "./order.schema";
import {AdminChatStatus, PatientChatLevel} from "../admin-chat/types/enum";
import {UrlSchema, UrlSchemaModelInterface} from "./prescription.schema";

export interface PromotionModelInterface {
  aliasId?: string;
  role: UserRole;
  user: string;
}

export interface AdvertisementModelInterface extends PromotionModelInterface {
  name: string;
  urlBucket: UrlSchemaModelInterface[];
  description: string;
  tags: string[];
}

export interface AdvertisementModelStructure extends mongoose.Document, AdvertisementModelInterface {
}

export const AdvertisementSchema = new mongoose.Schema({
  name: {type: String, required: true},
  urlBucket: {type: [UrlSchema], required: true},
  description: {type: String, required: true},
  tags: {type: Array, required: true},
})

export const PromotionSchema = new mongoose.Schema({
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  role: {type: UserRole, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, required: true}
}, {timestamps: true, discriminatorKey: 'type'});