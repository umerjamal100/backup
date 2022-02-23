import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {
  AdministrationModelInterface,
  AdminModelInterface,
  AdminModelStructure,
  SubAdminModelStructure
} from "../schemas/admin.schema";
import {AddressHelper} from "../helpers/address.helper";
import {SubAdminDTO} from "../auth/types/dto/auth.dto";
import {PointModelStructure} from "../schemas/address.schema";
import * as bcrypt from "bcrypt";
import {
  AdminInformationChatHeadsDTO,
  AdminOrderChatHeadsDTO,
  PatchAdminChatDTO,
  PatchAdminDTO
} from "./types/admin.dto";
import {AdminChatService} from "../admin-chat/admin-chat.service";
import {ResponseUtils} from "../helpers/utils/response.utils";
import * as _ from 'lodash'
import {AdminChatPaginationDTO, AdminMessage} from "../users/types/dto/user.dto";
import {PaginationResponse} from "../common/responses.common";
import {Buckets} from "../helpers/interfaces/aws.helper.interface";
import {PharmacyModelStructure} from "../schemas/pharmacy.schema";
import {UserModelStructure} from "../schemas/interfaces/user.interface";
import {UserRole} from "../common/enum.common";

@Injectable()
export class AdminService {

  constructor(
    @InjectModel('admin')
    private readonly adminModel: Model<AdminModelStructure>,
    @InjectModel('subAdmin')
    private readonly subAdminModel: Model<SubAdminModelStructure>,
    @InjectModel('Pharmacy')
    private readonly pharmacyModel: Model<PharmacyModelStructure>,
    @InjectModel('User')
    private readonly userModel: Model<UserModelStructure>,
    private readonly addressHelper: AddressHelper,
    private readonly adminChatService: AdminChatService,
    private readonly responseUtils: ResponseUtils,
  ) {
  }

  // create
  async createAdmin(body: AdministrationModelInterface): Promise<any> {
    try {
      body.password = bcrypt.hashSync(body.password, 8)
      return (await new this.adminModel({...body, kind: 'admin'}).save()).toObject()
    } catch (e) {
      throw new Error(e)
    }
  }

  async createSubAdmin(body: SubAdminDTO): Promise<any> {
    const location = await this.addressHelper.toLngLat(body.addresses['coordinates'])
    body.addresses.location = {
      type: 'Point',
      coordinates: location
    } as PointModelStructure
    body.password = bcrypt.hashSync(body.password, 8)
    return (await new this.subAdminModel({...body, kind: 'subAdmin'}).save()).toObject()
  }

  // read
  async findOneAdmin(adminId: string): Promise<any> {
    return this.adminModel.findById(adminId).lean()
  }

  async getAdmin(): Promise<AdminModelInterface> {
    return this.adminModel.findOne().lean()
  }

  async getAdminOrderChatHeads(body: AdminOrderChatHeadsDTO): Promise<any> {
    try {
      const {limit, role} = body
      let data
      switch (role) {
        case UserRole.Patient:
          data = await this.adminChatService.getAdminOrderChatHeads(body, 'to lastUserMessage lastAdminMessage')
          break
        case UserRole.Pharmacy:
          data = await this.adminChatService.getAdminPharmacyOrderChatHeads(body, 'to lastUserMessage lastAdminMessage')
          break
      }
      return await this.responseUtils.paginationResponse(data, limit)
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminInformationChatHeads(body: AdminInformationChatHeadsDTO): Promise<any> {
    try {
      const {limit} = body
      const data = await this.adminChatService.getAdminInformationChat(body, [{
        path: 'to',
        model: body.role === UserRole.Pharmacy ? this.pharmacyModel : this.userModel
      }, {
        path: 'lastUserMessage'
      }])
      return await this.responseUtils.paginationResponse(data, limit)
    } catch (e) {
      console.log(e)
    }
  }

  async getAdminChatMessages(query: AdminChatPaginationDTO): Promise<PaginationResponse> {
    try {
      const data = await this.adminChatService.getAdminChatMessages(query)
      return await this.responseUtils.paginationResponse(data, query.limit)
    } catch (e) {
      console.log(e)
    }
  }

  async findOneSubAdmin(subAdminId: string): Promise<any> {
    return this.subAdminModel.findById(subAdminId).lean()
  }

  // update
  async patchAdmin(body: PatchAdminDTO, user: any) {

  }

  async patchSubAdmin(body: PatchAdminDTO, user: any) {

  }

  async saveOrderMessageAdmin(adminMessage: AdminMessage, user: any): Promise<any> {
    try {
      const {adminChatId, content, urlBucket} = adminMessage
      const head = await this.adminChatService.getAdminOrderChatById(adminChatId)
      if (_.isEmpty(head))
        throw new UnprocessableEntityException('Chat not created with this id')
      const {adminId} = head
      // if (adminId.toString() !== user._id.toString())
      //   throw new UnprocessableEntityException('You are not allowed in this chat')

      if (urlBucket)
        for (const _urlBucket of urlBucket) {
          _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
        }
      const message = {
        adminChatId,
        from: user ? user['_id'].toString() : '60d46390307f9d3ae889c38b',  //staging admin id
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminOrderChat(adminChatId, {
        lastAdminMessage: savedMessage['_id'].toString()
      })
      return savedMessage
    } catch (e) {
      throw e
    }
  }

  async savePharmacyOrderMessageAdmin(adminMessage: AdminMessage, user: any): Promise<any> {
    try {
      const {adminChatId, content, urlBucket} = adminMessage
      const head = await this.adminChatService.getAdminPharmacyOrderChatById(adminChatId)
      if (_.isEmpty(head))
        throw new UnprocessableEntityException('Chat not created with this id')
      const {adminId} = head
      // if (adminId.toString() !== user._id.toString())
      //   throw new UnprocessableEntityException('You are not allowed in this chat')

      if (urlBucket)
        for (const _urlBucket of urlBucket) {
          _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
        }
      const message = {
        adminChatId,
        from: user ? user['_id'].toString() : '60d46390307f9d3ae889c38b',  //staging admin id
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminPharmacyOrderChat(adminChatId, {
        lastAdminMessage: savedMessage['_id'].toString()
      })
      return savedMessage
    } catch (e) {
      throw e
    }
  }

  async saveInformationMessageAdmin(adminMessage: AdminMessage, user: any): Promise<any> {
    try {
      const {adminChatId, content, urlBucket} = adminMessage
      const head = await this.adminChatService.getAdminInformationChatById(adminChatId)
      if (_.isEmpty(head))
        throw new UnprocessableEntityException('Chat not created with this id')

      if (urlBucket)
        for (const _urlBucket of urlBucket) {
          _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
        }
      const message = {
        adminChatId,
        from: user ? user['_id'].toString() : '60d46390307f9d3ae889c38b',  //staging admin id
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminInformationChat(adminChatId, {
        lastAdminMessage: savedMessage['_id'].toString()
      })
      return savedMessage
    } catch (e) {
      throw e
    }
  }

  async patchAdminOrderChat(body: PatchAdminChatDTO): Promise<any> {
    try {
      const {status, adminChatId} = body
      const adminOrderChat = await this.adminChatService.getAdminOrderChatById(adminChatId)
      if (_.isEmpty(adminOrderChat))
        throw new UnprocessableEntityException('adminChatId does not exist')
      return await this.adminChatService.patchAdminOrderChat(adminChatId, {status})
    } catch (e) {
      throw e
    }
  }


  async patchAdminPharmacyOrderChat(body: PatchAdminChatDTO): Promise<any> {
    try {
      const {status, adminChatId} = body
      const adminOrderChat = await this.adminChatService.getAdminPharmacyOrderChatById(adminChatId)
      if (_.isEmpty(adminOrderChat))
        throw new UnprocessableEntityException('adminChatId does not exist')
      return await this.adminChatService.patchAdminPharmacyOrderChat(adminChatId, {status})
    } catch (e) {
      throw e
    }
  }

  async patchAdminInformationChat(body: PatchAdminChatDTO): Promise<any> {
    try {
      const {status, adminChatId} = body
      const adminInformationChat = await this.adminChatService.getAdminInformationChatById(adminChatId)
      if (_.isEmpty(adminInformationChat))
        throw new UnprocessableEntityException('adminChatId does not exist')
      return await this.adminChatService.patchAdminInformationChat(adminChatId, {status})
    } catch (e) {
      throw e
    }
  }

  // delete
}
