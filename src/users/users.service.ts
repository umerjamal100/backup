import {Injectable, NotFoundException, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {OriginalTransactionInterface, User, UserModelStructure} from '../schemas/interfaces/user.interface';
import {Model, Types} from 'mongoose';
import {
  AddressDto,
  AdminChatPaginationDTO,
  AdminMessage,
  AdminOrderChatDTO,
  FavoritesParams,
  PatchProfileDTO,
  RatingDTO,
  SaveCardTransactionDTO,
  UserClickedDto,
  UserPaymentAcceptanceDTO
} from './types/dto/user.dto';
import {FBMeInterface} from '../auth/types/interfaces/facebook.interface';
import {GoogleJsonResponse} from '../auth/types/interfaces/google.interface';
import {AddressModelInterface, AddressModelStructure} from '../schemas/address.schema';
import {IDPProfileInterface} from '../helpers/interfaces/auth.helper';
import {FamilyModelInterface} from '../schemas/family.schema';
import {UsersHelper} from '../helpers/users.helper';
import {DocumentService} from '../document/document.service';
import {AddressHelper} from '../helpers/address.helper';
import {BucketStatusEnum} from "../order/types/enums/order.enum";
import {BucketService} from "../order/bucket.service";
import {OrderHelper} from "../order/helper/order.helper";
import {ErrorUtils} from "../helpers/utils/error.utils";
import {RiderService} from "../rider/rider.service";
import {PharmacyService} from "../pharmacy/pharmacy.service";
import {OrderService} from "../order/order.service";
import {ProductModelInterface} from "../schemas/product.schema";
import {ProductService} from "../product/product.service";
import * as _ from "lodash"
import {Buckets} from "../helpers/interfaces/aws.helper.interface";
import {AdminChatService} from "../admin-chat/admin-chat.service";
import {InformationChatModelInterface, OrderChatModelInterface} from "../schemas/adminChatSchema";
import {UserRole} from "../common/enum.common";
import {AdminService} from "../admin/admin.service";
import {AdminChatStatus, PatientChatLevel} from "../admin-chat/types/enum";
import {ResponseUtils} from "../helpers/utils/response.utils";
import {PaginationResponse} from "../common/responses.common";
import {UnRatedOrdersResponse} from "../order/types/interfaces/order.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserModelStructure>,
    private readonly usersHelper: UsersHelper,
    private readonly documentService: DocumentService,
    private readonly addressHelper: AddressHelper,
    private readonly bucketService: BucketService,
    private readonly orderService: OrderService,
    private readonly pharmacyService: PharmacyService,
    private readonly riderService: RiderService,
    private readonly errorUtils: ErrorUtils,
    private readonly orderHelper: OrderHelper,
    private readonly productService: ProductService,
    private readonly adminChatService: AdminChatService,
    private readonly adminService: AdminService,
    private readonly responseUtils: ResponseUtils,
  ) {
  }

  async findByIdAndUpdate(userId: string, obj: any, populate: any): Promise<User> {
    try {
      return this.userModel.findOneAndUpdate({_id: userId}, obj, {new: true}).populate(populate).lean()

    } catch (e) {
      console.log(e)
    }
  }

  // TODO there shou;ld be complete mechanism for email and phone update
  // TODO add verification for phone and email update
  // TODO emiratesId verification
  async patchProfile(profile: PatchProfileDTO, userId: string, session: any): Promise<User> {
    const profileData = profile;
    let docs: any = profile;
    let data: any = {
      $set: {...profileData},
    };
    try {
      /**
       * fan out documents,
       */
        // start transactions
      const user = await this.userModel.findOneAndUpdate({_id: userId}, data, {
          new: true,
          lean: true,
        }).select({
          password: 0,
          active: 0,
          emailVerified: 0,
          phoneVerified: 0,
          __v: 0,
          deleted: 0,
        });
      await this.documentService.updateOnPatchProfile({...docs, _id: userId});
      session.passport.user = {...session.passport.user, ...profileData}
      session.save()
      return user;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async patchAddress(updatedAddress: AddressDto, {id}, userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId)
      const userAddresses = user.addresses
      const addresses: AddressModelInterface[] = userAddresses.map(address => {
        if (address['_id'].toString() === id) {
          const coordinates = Array.from((updatedAddress.coordinates as string).split(','), Number).reverse();
          delete updatedAddress.coordinates;
          updatedAddress['location'] = {type: 'Point', coordinates};
          return updatedAddress
        } else
          return address
      }) as AddressDto[]
      return this.userModel.findOneAndUpdate(
        {_id: userId},
        {
          $set: {addresses},
        },
        {new: true}).lean();
    } catch (e) {
      console.log(e)
    }
  }

  async deleteAddress({id}, userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId)
      const {addresses} = user
      const filteredArray = addresses.filter(address => {
        return address['_id'].toString() !== id
      });
      return this.userModel.findOneAndUpdate(
        {_id: userId},
        {
          $set: {addresses: filteredArray},
        },
        {new: true});
    } catch (e) {
      console.log(e)
    }
  }

  async findOrCreateFbProfile(profile: FBMeInterface): Promise<User> {
    const user = await this.userModel.findOne({
      $or: [{'idps.userId': profile.id}, {email: profile.email}],
    }).lean();
    if (user) {
      if (user.idps.map(idp => idp.provider).includes('FACEBOOK'))
        return user;
      else return this.userModel.findOneAndUpdate({
        email: profile.email,
      }, {
        $push: {
          idps: {
            $each: [{
              userId: profile.id,
              provider: 'FACEBOOK',
            }],
          },
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO role assignment
    const newUser: User = {
      email: profile.email || `${profile.id}@facebook.com`,
      firstName: profile.first_name,
      lastName: profile.last_name,
      profilePic: (profile.id) ? {
        bucketName: Buckets.PROFILE,
        url: 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
      } : undefined,
      idps: [{
        userId: profile.id,
        provider: 'FACEBOOK',
        refreshToken: profile.refreshToken,
        accessToken: profile.accessToken,
      }],
    };
    return new this.userModel(newUser).save();
  }

  async findOrCreateGoogleProfile(profile: GoogleJsonResponse): Promise<User> {
    const user = await this.userModel.findOne({
      $or: [{'idps.userId': profile.sub}, {email: profile.email}],
    }).lean();
    if (user) {
      if ((user.idps || []).map(idp => idp.provider).includes('GOOGLE'))
        return user;
      else return this.userModel.findOneAndUpdate({
        email: profile.email,
      }, {
        $push: {
          idps: {
            $each: [{
              userId: profile.sub,
              provider: 'GOOGLE',
            }],
          },
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO role assignment
    const newUser: User = {
      email: profile.email,
      firstName: profile.given_name,
      lastName: profile.family_name,
      profilePic: {bucketName: Buckets.PROFILE, url: profile.picture},
      idps: [{
        userId: profile.sub,
        provider: 'GOOGLE',
        refreshToken: profile.refreshToken,
        accessToken: profile.accessToken,
      }],
    };
    return new this.userModel(newUser).save();
  }

  async getMe(_id: string): Promise<User> {
    try {
      const me = await this.userModel.findOne({_id})
        .select({
          password: 0,
          active: 0,
          // emailVerified: 0,
          // phoneVerified: 0,
          __v: 0,
          deleted: 0,
          idps: 0,
          // 'relations.emiratesId': 0,
          //'relations.emiratesIdPic': 0,
        });
      return me;
    } catch (e) {
      console.warn(e);
    }
  }

  async patchRelations(relation: FamilyModelInterface, userId: string, session): Promise<any> {
    try {
      const relations = await this.userModel.findOneAndUpdate({
        _id: userId, // to prevent IDOR
        'relations._id': relation._id,
      }, {'relations.$': relation}, {lean: true, new: true})
      const docs = await this.documentService.updateOnPatchRelation(relations?.relations?.find(rel => rel.emiratesId === relation.emiratesId), userId);
      session.passport.user = relations
      session.save()
      return relation;
    } catch (e) {
      console.warn(e);
    }
  }

  async deleteRelations(id: string, userId: string, session: any): Promise<any> {
    try {
      const relation = await this.userModel.findOneAndUpdate({
        _id: userId, // to prevent IDOR
      }, {
        $pull: {
          relations: {_id: Types.ObjectId(id)},
        },
      }, {lean: true, new: true})
      session.passport.user = relation
      session.save()
      return relation;
    } catch (e) {
      console.warn(e);
    }
  }

  async addRelations(relation: FamilyModelInterface, userId: string, session): Promise<any> {
    try {
      const relations = await this.userModel.findOneAndUpdate({
        _id: userId, // to prevent IDOR
        // 'relations.emiratesId': { $ne: relation.emiratesId },
      }, {$push: {relations: {$each: [relation]}}}, {lean: true, new: true});
      const docs = await this.documentService.updateOnPatchProfile({
        relations: relations?.relations?.filter(rel => rel.emiratesId === relation.emiratesId),
        _id: userId,
      });

      session.passport.user = relations
      session.save()
      return relations;

    } catch (e) {
      console.warn(e);
    }
  }

  // TODO cretae 2dsphere index on `address.location`
  async addAddress(address: AddressDto, userId: string): Promise<AddressModelStructure[]> {
    const coordinates = Array.from((address.coordinates as string).split(','), Number).reverse();
    delete address.coordinates;
    address['location'] = {type: 'Point', coordinates};
    try {
      const addres = await this.userModel.findOne({
        _id: userId,
        'addresses.location': {
          $near: {
            $geometry: {type: 'Point', coordinates},
            $minDistance: 0,
            $maxDistance: 0,
          },
        },
      });
      let data = {};
      let added;
      if (addres) {
        data = {$set: {'addresses.$': address}};
        added = await this.userModel.findOneAndUpdate({
          _id: userId,
          'addresses.location': {
            $near: {
              $geometry: {type: 'Point', coordinates},
              $minDistance: 0,
              $maxDistance: 0,
            },
          },
        }, data, {lean: true, new: true});
      } else {
        data = {$push: {addresses: address}};
        added = await this.userModel.findOneAndUpdate({
          _id: userId,
        }, data, {lean: true, new: true});
      }
      return added;
    } catch (e) {
      console.warn(e);
    }
  }

  async userRating(ratings: RatingDTO, userId: string): Promise<any> {
    const {riderRating, riderFeedback, bucketFeedback, bucketRating, orderFeedback, orderRating, bucketId, orderId} = ratings
    try {
      const bucket = await this.bucketService.getCustomPopulatedBucketById(bucketId, "")
      if (bucket.orderId !== orderId)
        throw new UnprocessableEntityException('Bucket does not belongs to this order')
      const {riderId, pharmacy} = bucket
      if (riderRating || riderFeedback) {
        await this.riderService.rateRider(riderId as string, riderRating)
        await this.bucketService.addRiderRatingToBucket(bucketId, {rating: riderRating, feedback: riderFeedback})
      }
      if (bucketRating || bucketFeedback) {
        await this.pharmacyService.ratePharmacy(pharmacy as string, bucketRating)
        await this.bucketService.addRatingToBucket(bucketId, {rating: bucketRating, feedback: bucketFeedback})
      }
      if (orderRating || orderFeedback) {
        await this.orderService.addRatingToOrder(orderId as string, {rating: orderRating, feedback: orderFeedback})
      }
    } catch (e) {
      console.warn(e);
      throw e
    }
  }

  async findOrCreate(profile: IDPProfileInterface): Promise<User> {
    try {
      let user: User = await this.userModel.findOne(
        {
          idps: {
            $elemMatch: {
              provider: profile.IDP,
              userId: profile.userId,
            },
          },
        }, {}, {
          lean: true,
        });
      if (user) {
        return user;
      } else {
        user = await this.userModel.findOneAndUpdate({
          email: profile.email,
        }, {
          $push: {
            idps: {
              provider: profile.IDP,
              userId: profile.userId,
            },
          },
          isActive: true,
          isVerified: true,
          isShadow: false,
        }, {
          new: true,
          lean: true,
        }) as User;
        if (user) {
          return user;
        } else {
          user = {
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            // tslint:disable-next-line:no-null-keyword
            password: null,
            emailVerified: true,
            profilePic: {bucketName: Buckets.PROFILE, url: profile.profile},
            idps: [{
              provider: profile.IDP,
              userId: profile.userId,
            }],
          };
          return (await new this.userModel(user).save()).toObject();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // TODO emirates ID must be extracted via OCR, else there would be data leak
  async getRelationships(emiratesId: string): Promise<User[]> {
    try {
      const relationships = await this.userModel.find({
        'relations.emiratesId': emiratesId,
      }, {
        'relations.$': 1,
        gender: 1,
        firstName: 1,
        lastName: 1,
        emiratesId: 1,
        profilePic: 1,
        emiratesIdPic: 1,
        _id: 1,
      });
      return relationships;
    } catch (e) {
      console.error(e);
      throw new UnprocessableEntityException();

    }
  }

  // get session for transaction
  async getSession() {
    try {
      const session = await this.userModel.db.startSession();
      return session;
    } catch (e) {
      console.error(e);
    }
  }

  async paymentAcceptance(body: UserPaymentAcceptanceDTO, user: any) {
    try {
      const {isAccepted, orderId, type} = body;
      let order;
      if (isAccepted)
        order = await this.orderHelper.userPaymentAccept(orderId, user, BucketStatusEnum.USER_PAYMENT_CONFIRMED, type)
      if (!isAccepted) {
        order = await this.orderHelper.userPaymentReject(orderId, user, BucketStatusEnum.USER_PAYMENT_REJECTED)
      }
      return order

    } catch (e) {
      this.errorUtils.errorHandler(e)
    }
  }

  async addFavoriteMedicine(query: FavoritesParams, user: User) {
    try {
      const product = await this.productService.findOneAndCustomPopulate(query, "")
      if (_.isEmpty(product))
        throw new NotFoundException('Product not found')

      await this.findByIdAndUpdate(user._id, {
        $addToSet: {
          favorites: query.drugCode
        }
      }, "")
    } catch (e) {
      console.log(e)
    }

  }

  async removeFavouriteMedicine(query: FavoritesParams, user: any) {
    try {
      await this.findByIdAndUpdate(user._id, {
        $pull: {
          favorites: query.drugCode
        }
      }, "")
    } catch (e) {
      console.log(e)
    }
  }

  async getFavoriteMedicines(userId: string): Promise<ProductModelInterface> {
    try {
      const user: User = await this.userModel.findById(userId).lean()
      const {favorites} = user
      const products = await this.productService.findAndCustomPopulate({drugCode: favorites}, "")
      return _.uniqBy(products, 'drugCode')
    } catch (e) {
      console.log(e)
    }
  }

  async openAdminOrderChat(orderChat: AdminOrderChatDTO, user: any): Promise<OrderChatModelInterface> {
    try {
      const {orderId, bucketId, chatLevel} = orderChat
      const order = await this.orderService.getCustomPopulatedOrderById(orderId, "")
      if (_.isEmpty(order))
        throw new UnprocessableEntityException('Order does not exist')
      if (chatLevel === PatientChatLevel.BUCKET && !(order.allBuckets as string[]).map(bucket => bucket.toString()).includes(bucketId))
        throw new UnprocessableEntityException('Bucket does not belongs to this Order')
      const head = await this.adminChatService.getSingleAdminOrderChatByKey({
        order: orderId,
        ...(chatLevel === PatientChatLevel.BUCKET && {bucket: bucketId}),
        role: UserRole.Patient,
        chatLevel
      })
      if (!_.isEmpty(head))
        throw new UnprocessableEntityException('Chat Already exist for this order')

      const admin = await this.adminService.getAdmin()
      if (_.isEmpty(admin))
        throw new UnprocessableEntityException('No Admin exist')
      const adminOrderChat: OrderChatModelInterface = {
        adminId: admin['_id'].toString(),
        order: orderId,
        bucket: bucketId,
        chatLevel,
        role: UserRole.Patient,
        status: AdminChatStatus.PENDING,
        to: user._id.toString(),
        unread: 0
      }
      const chatHead = await this.adminChatService.createAdminOrderChat(adminOrderChat)

      if (chatLevel === PatientChatLevel.BUCKET)
        await this.bucketService.findOneAndUpdate({_id: bucketId}, {adminOrderChat: chatHead['_id'].toString()}, '')
      else
        await this.orderService.findOneAndUpdate(orderId, {adminOrderChat: chatHead['_id'].toString()}, '')

      return chatHead
    } catch (e) {
      if (e.status && e.status === 422)
        throw e
      throw e
    }
  }

  async openAdminInformationChat(user: any, body: UserClickedDto): Promise<InformationChatModelInterface> {
    try {
      const {userClicked} = body
      const adminInformationChat = await this.adminChatService.getSingleAdminInformationChatByKey({
        role: UserRole.Patient,
        to: user._id.toString(),
        status: AdminChatStatus.PENDING,
      }, "lastAdminMessage")
      if (_.isEmpty(adminInformationChat) && userClicked) {
        const admin = await this.adminService.getAdmin()
        const adminInformationChat: InformationChatModelInterface = {
          adminId: admin['_id'].toString(),
          role: UserRole.Patient,
          status: AdminChatStatus.PENDING,
          to: user._id.toString(),
          unread: 0
        }
        return await this.adminChatService.createAdminInformationChat(adminInformationChat)
      }
      return adminInformationChat
    } catch (e) {
      console.log(e)
    }
  }

  async saveOrderMessageAdmin(adminMessage: AdminMessage, user: any): Promise<any> {
    try {
      const {adminChatId, content, urlBucket} = adminMessage
      const head = await this.adminChatService.getAdminOrderChatById(adminChatId)
      if (_.isEmpty(head))
        throw new UnprocessableEntityException('Chat not created with this id')
      const {to} = head
      if (to.toString() !== user._id.toString())
        throw new UnprocessableEntityException('You are not allowed in this chat')

      if (urlBucket)
        for (const _urlBucket of urlBucket) {
          _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
        }
      const message = {
        adminChatId,
        from: user['_id'].toString(),
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminOrderChat(adminChatId, {
        lastUserMessage: savedMessage['_id'].toString()
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
        from: user['_id'].toString(),
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminInformationChat(adminChatId, {
        lastUserMessage: savedMessage['_id'].toString()
      })
      return savedMessage
    } catch (e) {
      throw e
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

  async saveCardOriginalTransaction(body: SaveCardTransactionDTO, userId: any, session) {
    try {
      const {card, completeCode, tranRef} = body
      const originalTransaction: OriginalTransactionInterface = {card, completeCode, tranRef}
      const user = await this.userModel.findOneAndUpdate(
        {_id: userId.toString(), 'originalTransactions.tranRef': {$ne: tranRef}},
        {$push: {originalTransactions: {$each: [originalTransaction]}}},
        {
          lean: true,
          new: true
        })
      if (!_.isEmpty(user)) {
        session.passport.user = user
        session.save()
      } else {
        throw new UnprocessableEntityException('Ref already exist')
      }
      return user
    } catch (e) {
      throw e
    }
  }

  async getUnratedOrders(user: User): Promise<UnRatedOrdersResponse> {
    try {
      return await this.orderService.getUnratedOrders(user)
    } catch (e) {
      throw e
    }
  }
}
