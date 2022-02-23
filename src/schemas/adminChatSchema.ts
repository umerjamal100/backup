import * as mongoose from "mongoose";
import {BucketModelInterface} from "./bucket.schema";
import {nanoid} from "nanoid";
import {UserRole} from "../common/enum.common";
import {AdminModelInterface, SubAdminModelInterface} from "./admin.schema";
import {OrderModelInterface} from "./order.schema";
import {AdminChatStatus, PatientChatLevel} from "../admin-chat/types/enum";

export interface AdminChatModelInterface {
  status: AdminChatStatus;
  aliasId?: string;
  unread: number,
  adminId: string | AdminModelInterface | SubAdminModelInterface,
  role: UserRole,
  lastAdminMessage?: string,
  lastUserMessage?: string,
}

export interface PartialAdminChatModelInterface {
  status?: AdminChatStatus;
  lastAdminMessage?: string;
  lastUserMessage?: string;
}

export interface OrderChatModelInterface extends AdminChatModelInterface {
  order: string | OrderModelInterface;
  bucket?: string | BucketModelInterface;
  chatLevel: PatientChatLevel,
  to: string,
}

export interface PharmacyOrderChatModelInterface extends AdminChatModelInterface {
  order: string | OrderModelInterface;
  bucket: string | BucketModelInterface;
  to: string,
}

export interface InformationChatModelInterface extends AdminChatModelInterface {
  to: string,
}

export interface OrderChatModelStructure extends mongoose.Document, OrderChatModelInterface {
}

export interface PharmacyOrderChatModelStructure extends mongoose.Document, PharmacyOrderChatModelInterface {
}

export interface InformationChatModelStructure extends mongoose.Document, InformationChatModelInterface {
}

export const OrderChatSchema = new mongoose.Schema({
  order: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order'},
  bucket: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Bucket'},
  chatLevel: {type: PatientChatLevel, required: true},
  to: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
})

export const PharmacyOrderChatSchema = new mongoose.Schema({
  order: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order'},
  bucket: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bucket'},
  to: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pharmacy'},
})

export const InformationChatSchema = new mongoose.Schema({
  to: {type: mongoose.Schema.Types.ObjectId, required: true},
})

export const AdminChatSchema = new mongoose.Schema({
  status: {type: AdminChatStatus, required: true, default: AdminChatStatus.PENDING},
  aliasId: {
    type: String,
    default: () => nanoid(5) + `-` + nanoid(4),
    required: true
  },
  unread: {type: Number, default: 0},
  adminId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Admin'},
  role: {type: UserRole, required: true},
  lastAdminMessage: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'AdminChatMessage'},
  lastUserMessage: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'AdminChatMessage'},
}, {timestamps: true, discriminatorKey: 'type'});