import * as mongoose from "mongoose";
import {UrlSchema, UrlSchemaModelInterface} from "./prescription.schema";

export interface AdminChatMessageSchemaInterface {
  adminChatId: string;
  from: string;
  content: string;
  urlBucket: UrlSchemaModelInterface[];
  isRead: boolean;
}

export interface AdminChatMessageModelStructure extends mongoose.Document, AdminChatMessageSchemaInterface {
}

export const AdminChatMessageSchema = new mongoose.Schema({
  from: {type: mongoose.Schema.Types.ObjectId, required: true},
  adminChatId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AdminChat'},
  content: {type: String, required: true, default: ""},
  urlBucket: {type: [UrlSchema], required: true},
  isRead: {type: Boolean, default: 0, required: false}
}, {timestamps: true})
