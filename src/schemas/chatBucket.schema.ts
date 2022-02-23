import * as mongoose from "mongoose";
import {BucketModelInterface} from "./bucket.schema";
import {UrlSchema, UrlSchemaModelInterface} from "./prescription.schema";

export interface ChatBucketModelInterface {
  bucket: string | BucketModelInterface;
  messages?: ChatSchemaInterface[]
}

export interface PartialChatBucketModelInterface {
  bucket?: string | BucketModelInterface;
  messages?: ChatSchemaInterface[]
}

export interface ChatSchemaInterface {
  from: string;
  content: string;
  urlBucket: UrlSchemaModelInterface[];
}

export interface ChatBucketModelStructure extends mongoose.Document, ChatBucketModelInterface {
}

const chatSchema = new mongoose.Schema({
  from: {type: mongoose.Schema.Types.ObjectId, required: true},
  content: {type: String, required: true, default: ""},
  urlBucket: {type: [UrlSchema], required: true},
}, {_id: false, timestamps: true})

export const ChatBucketSchema = new mongoose.Schema({
  bucket: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Bucket'},
  messages: [chatSchema],
});