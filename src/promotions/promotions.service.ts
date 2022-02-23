import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateAdvertisementDto, UpdateAdvertisementDTO} from './dto/create-promotion.dto';
import {AdvertisementModelInterface, AdvertisementModelStructure} from "../schemas/promotion.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {UserRole} from "../common/enum.common";
import {PaginationDTO} from "../admin/types/admin.dto";
import {ResponseUtils} from "../helpers/utils/response.utils";
import {PaginationResponse} from "../common/responses.common";
import * as _ from 'lodash'
import {
  PatchRequestAdvertisementDto,
  RequestAdvertisementDto,
  RequestPromotionStatusDto
} from "./dto/request-promotion.dto";
import {
  RequestAdvertisementModelInterface,
  RequestAdvertisementModelStructure
} from "../schemas/requestPromotion.schema";

@Injectable()
export class PromotionsService {

  constructor(
    @InjectModel('advertisement')
    private readonly advertisementModel: Model<AdvertisementModelStructure>,
    @InjectModel('reqAdvertisement')
    private readonly requestAdvertisementModel: Model<RequestAdvertisementModelStructure>,
    private readonly responseUtils: ResponseUtils
  ) {
  }

  async createAdvertisement(createPromotionDto: CreateAdvertisementDto, user: any): Promise<AdvertisementModelInterface> {
    try {
      const {urlBucket, description, tags, name} = createPromotionDto

      const advertisement = {
        name,
        urlBucket,
        description,
        tags,
        role: UserRole.Pharmacy,
        user: user.user ?? ''
      }

      return (await new this.advertisementModel(advertisement).save()).toObject();
    } catch (e) {
      throw e
    }
  }

  async updateAdvertisement(updatePromotionDto: UpdateAdvertisementDTO, user: any): Promise<AdvertisementModelInterface> {
    try {
      const {id} = updatePromotionDto
      const advertisement = await this.advertisementModel.findById(id).lean()
      if (_.isEmpty(advertisement))
        throw new NotFoundException('advertisement not found')


      return await this.advertisementModel.findOneAndUpdate({_id: id}, updatePromotionDto, {new: true})
    } catch (e) {
      throw e
    }
  }

  async getAdvertisements(body: PaginationDTO, user: any, populate?: any): Promise<PaginationResponse> {
    try {
      const {cursor, limit} = body
      const advertisement = await this.advertisementModel.find({
        $and: [
          {user: user.user.toString()}
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({createdAt: -1}).limit(limit + 1 || 50).populate(populate).lean()
      return await this.responseUtils.paginationResponse(advertisement, limit)
    } catch (e) {
      throw e
    }
  }

  async getRequestAdvertisements(body: RequestPromotionStatusDto, user: any, populate?: any): Promise<PaginationResponse> {
    try {
      const {cursor, limit, status} = body
      const advertisement = await this.requestAdvertisementModel.find({
        $and: [
          {
            user: user.user.toString(),
            status
          }
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({createdAt: -1}).limit(limit + 1 || 50).populate(populate).lean()
      return await this.responseUtils.paginationResponse(advertisement, limit)
    } catch (e) {
      throw e
    }
  }

  async getAdminRequestAdvertisements(body: RequestPromotionStatusDto, user: any, populate?: any): Promise<PaginationResponse> {
    try {
      const {cursor, limit, status} = body
      const advertisement = await this.requestAdvertisementModel.find({
        $and: [
          {
            status
          }
          ,
          {
            ...(cursor && {_id: {$lt: cursor}}),
          },
        ],
      }).sort({createdAt: -1}).limit(limit + 1 || 50).populate(populate).lean()
      return await this.responseUtils.paginationResponse(advertisement, limit)
    } catch (e) {
      throw e
    }
  }

  async deleteAdvertisement(_id: string, user: any): Promise<AdvertisementModelInterface> {
    try {
      const advertisement = await this.advertisementModel.findById(_id).lean()
      if (_.isEmpty(advertisement))
        throw new NotFoundException('Advertisement not found')

      return await this.advertisementModel.findOneAndRemove({_id}).lean()
    } catch (e) {
      throw e
    }
  }

  async requestAdvertisement(body: RequestAdvertisementDto, user: any): Promise<RequestAdvertisementModelInterface> {
    try {
      const {startDate, status, endDate, advertisement} = body

      const ad = await this.advertisementModel.findById(advertisement).lean()
      if (_.isEmpty(ad))
        throw new NotFoundException('Advertisement not found')

      const reqAdvertisement: RequestAdvertisementModelInterface = {
        endDate,
        advertisement,
        role: UserRole.Pharmacy,
        startDate,
        status,
        user: user.user.toString()
      }
      return (await new this.requestAdvertisementModel(reqAdvertisement).save()).toObject();
    } catch (e) {
      throw e
    }
  }

  async patchAdvertisementRequest(body: PatchRequestAdvertisementDto, user: any): Promise<RequestAdvertisementModelInterface> {
    try {
      const {requestAdvertisementId} = body

      const advertisement = await this.requestAdvertisementModel.findById(requestAdvertisementId).lean()
      if (_.isEmpty(advertisement))
        throw new NotFoundException('Request of Advertisement not found')

      return this.requestAdvertisementModel.findOneAndUpdate({_id: requestAdvertisementId}, body, {new: true})
    } catch (e) {
      throw e
    }
  }

}
