import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {
  ChatBucketModelInterface,
  ChatBucketModelStructure,
  ChatSchemaInterface,
  PartialChatBucketModelInterface
} from "../schemas/chatBucket.schema";
import {BucketModelStructure} from "../schemas/bucket.schema";
import {MessageDTO} from "./types/dto/order.dto";
import * as _ from "lodash"

@Injectable()
export class ChatBucketService {
  constructor(
    @InjectModel('ChatBucket')
    private readonly chatBucketModel: Model<ChatBucketModelStructure>,
    @InjectModel('Bucket')
    private readonly BucketModel: Model<BucketModelStructure>,
  ) {
  }

  async create(chatBucketModel: ChatBucketModelInterface) {
    try {
      return (await this.chatBucketModel.create(chatBucketModel)).toObject();
    } catch (e) {
      console.error(e);
    }
  }

  async findOne(where: any, populate: any) {
    try {
      return await this.chatBucketModel.findOne(where).populate(populate).lean();
    } catch (e) {
      console.error(e);
    }
  }

  async updateOne(where, chatBucketModel: PartialChatBucketModelInterface) {
    try {
      return await this.chatBucketModel.updateOne(where, chatBucketModel);
    } catch (e) {
      console.error(e);
    }
  }

  async saveMessage(message: MessageDTO, userId: string): Promise<any> {
    try {
      const {chatBucketId, content, urlBucket} = message
      const chatBucket: ChatBucketModelInterface = await this.findOne({_id: chatBucketId}, "")
      if (_.isEmpty(chatBucket))
        throw new UnprocessableEntityException('ChatBucketId does not exist')
      const chat: ChatSchemaInterface = {content, from: userId.toString(), urlBucket}
      chatBucket.messages.push(chat)
      await this.updateOne({_id: chatBucketId}, chatBucket)
      return
    } catch (e) {
      console.log(e)
    }
  }

}