import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {
  AdminChatModelInterface,
  InformationChatModelInterface,
  InformationChatModelStructure,
  OrderChatModelInterface,
  OrderChatModelStructure,
  PartialAdminChatModelInterface,
  PharmacyOrderChatModelInterface,
  PharmacyOrderChatModelStructure
} from "../schemas/adminChatSchema";
import {AdminChatMessageModelStructure, AdminChatMessageSchemaInterface} from "../schemas/adminChatMessage.schema";
import {AdminChatPaginationDTO} from "../users/types/dto/user.dto";
import {AdminOrderChatHeadsDTO} from "../admin/types/admin.dto";

@Injectable()
export class AdminChatService {
  constructor(
    @InjectModel('adminOrderChat')
    private readonly adminOrderChatModel: Model<OrderChatModelStructure>,
    @InjectModel('adminPharmacyOrderChat')
    private readonly adminPharmacyOrderChatModel: Model<PharmacyOrderChatModelStructure>,
    @InjectModel('adminInformationChat')
    private readonly adminInformationChatModel: Model<InformationChatModelStructure>,
    @InjectModel('AdminChatMessage')
    private readonly adminChatMessageModel: Model<AdminChatMessageModelStructure>,
  ) {
  }

  async createAdminOrderChat(orderChat: OrderChatModelInterface): Promise<OrderChatModelInterface> {
    try {
      return (await new this.adminOrderChatModel(orderChat).save()).toObject();
    } catch (e) {
      console.log(e)
    }
  }

  async createAdminPharmacyOrderChat(pharmacyOrderChat: PharmacyOrderChatModelInterface): Promise<PharmacyOrderChatModelInterface> {
    try {
      return (await new this.adminPharmacyOrderChatModel(pharmacyOrderChat).save()).toObject();
    } catch (e) {
      console.log(e)
    }
  }

  async createAdminInformationChat(infoChat: InformationChatModelInterface): Promise<InformationChatModelInterface> {
    try {
      return (await new this.adminInformationChatModel(infoChat).save()).toObject();
    } catch (e) {
      console.log(e)
    }
  }

  async createAdminChatMessage(message: AdminChatMessageSchemaInterface): Promise<AdminChatMessageSchemaInterface> {
    try {
      return (await new this.adminChatMessageModel(message).save()).toObject();
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminOrderChatById(adminChatId: string): Promise<OrderChatModelInterface> {
    try {
      return await this.adminOrderChatModel.findById(adminChatId).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminPharmacyOrderChatById(adminChatId: string): Promise<PharmacyOrderChatModelInterface> {
    try {
      return await this.adminPharmacyOrderChatModel.findById(adminChatId).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminInformationChatById(adminChatId: string): Promise<InformationChatModelInterface> {
    try {
      return await this.adminInformationChatModel.findById(adminChatId).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getSingleAdminOrderChatByKey(key: any): Promise<OrderChatModelInterface> {
    try {
      return await this.adminOrderChatModel.findOne(key).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getSingleAdminInformationChatByKey(key: any, populate: string): Promise<InformationChatModelInterface> {
    try {
      return await this.adminInformationChatModel.findOne(key).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getSingleAdminPharmacyOrderChatByKey(key: any): Promise<PharmacyOrderChatModelInterface> {
    try {
      return await this.adminPharmacyOrderChatModel.findOne(key).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getSingleAdminPharmacyInformationChatByKey(key: any, populate: string): Promise<InformationChatModelInterface> {
    try {
      return await this.adminInformationChatModel.findOne(key).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminOrderChatHeads(where: AdminOrderChatHeadsDTO, populate: any): Promise<AdminChatModelInterface[]> {
    try {
      const {cursor, limit, status, role} = where
      return await this.adminOrderChatModel.find({
        $and: [
          {status, role}
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({updatedAt: -1}).limit(limit + 1 || 50).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminPharmacyOrderChatHeads(where: AdminOrderChatHeadsDTO, populate: any): Promise<AdminChatModelInterface[]> {
    try {
      const {cursor, limit, status, role} = where
      return await this.adminPharmacyOrderChatModel.find({
        $and: [
          {status, role}
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({updatedAt: -1}).limit(limit + 1 || 50).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminInformationChat(where: any, populate: any): Promise<AdminChatModelInterface[]> {
    try {
      const {cursor, limit, status, role} = where
      return await this.adminInformationChatModel.find({
        $and: [
          {status, role}
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({_id: -1}).limit(limit + 1 || 50).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminChatMessages(query: AdminChatPaginationDTO): Promise<AdminChatMessageSchemaInterface[]> {
    try {
      const {cursor, limit, adminChatId} = query
      return await this.adminChatMessageModel.find({
        $and: [
          {adminChatId}
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({_id: -1}).limit(limit + 1 || 50).lean()

    } catch (e) {
      console.log(e)
    }
  }

  async patchAdminOrderChat(adminChatId: string, data: PartialAdminChatModelInterface): Promise<any> {
    try {
      await this.adminOrderChatModel.updateOne({_id: adminChatId}, data, {new: true})
    } catch (e) {
      console.log(e)
    }
  }

  async patchAdminPharmacyOrderChat(adminChatId: string, data: PartialAdminChatModelInterface): Promise<any> {
    try {
      await this.adminPharmacyOrderChatModel.updateOne({_id: adminChatId}, data, {new: true})
    } catch (e) {
      console.log(e)
    }
  }

  async patchAdminInformationChat(adminChatId: string, data: PartialAdminChatModelInterface): Promise<any> {
    try {
      await this.adminInformationChatModel.updateOne({_id: adminChatId}, data, {new: true})
    } catch (e) {
      console.log(e)
    }
  }

  async patchAdminMessage(condition: any) {
    try {
      await this.adminChatMessageModel.updateMany(condition, {isRead: true})
    } catch (e) {
      console.log(e)
    }
  }
}

// ureadCount on Heads
//[
//   {
//     '$lookup': {
//       'from': 'adminchatmessages',
//       'let': {
//         'pId': '$_id'
//       },
//       'pipeline': [
//         {
//           '$match': {
//             '$expr': {
//               '$and': [
//                 {
//                   '$eq': [
//                     '$adminChatId', '$$pId'
//                   ]
//                 }, {
//                   '$eq': [
//                     '$isRead', false
//                   ]
//                 }
//               ]
//             }
//           }
//         }, {
//           '$group': {
//             '_id': null,
//             'count': {
//               '$sum': 1
//             }
//           }
//         }
//       ],
//       'as': 'unread'
//     }
//   }, {
//     '$unwind': {
//       'path': '$unread',
//       'includeArrayIndex': '0',
//       'preserveNullAndEmptyArrays': true
//     }
//   }, {
//     '$lookup': {
//       'from': 'adminchatmessages',
//       'localField': 'lastUserMessage',
//       'foreignField': '_id',
//       'as': 'lastUserMessage'
//     }
//   }, {
//     '$lookup': {
//       'from': 'adminchatmessages',
//       'localField': 'lastAdminMessage',
//       'foreignField': '_id',
//       'as': 'lastAdminMessage'
//     }
//   }, {
//     '$unwind': {
//       'path': '$lastUserMessage',
//       'includeArrayIndex': '0',
//       'preserveNullAndEmptyArrays': true
//     }
//   }, {
//     '$addFields': {
//       'unread': '$unread.count'
//     }
//   }
// ]