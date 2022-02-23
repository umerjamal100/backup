import {forwardRef, Inject, Injectable, NotFoundException, UnprocessableEntityException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PharmacyModelInterface, PharmacyModelStructure} from '../schemas/pharmacy.schema';
import * as mongoose from 'mongoose';
import {Model} from 'mongoose';
import {
  AdminPharmacyOrderChatDTO,
  BucketVideoDTO,
  CreatePharmacyDTO,
  PharmacyOrderAcceptanceDTO,
  StatsQueryDTO
} from './types/dto/pharmacy.dto';
import {AddressHelper} from '../helpers/address.helper';
import {NearestPharmacyInterface, PharmacyMatrixArray} from './types/interfaces/pharmacy.interface';
import {GoogleMapsHelper} from '../helpers/googleMaps.helper';
import {DistanceMatrixResponse} from '@googlemaps/google-maps-services-js/dist';
import * as _ from 'lodash';
import {User} from "../schemas/interfaces/user.interface";
import {BucketExtendedModel, BucketModelInterface} from "../schemas/bucket.schema";
import {BucketStatusEnum} from "../order/types/enums/order.enum";
import {BucketService} from "../order/bucket.service";
import {OrderHelper} from "../order/helper/order.helper";
import {ErrorUtils} from "../helpers/utils/error.utils";
import {LoginModelInterface, LoginModelStructure} from "../schemas/login.schema";
import {PharmacyRejectReasons} from "./types/enums/pharmacy.enum";
import {OrderService} from "../order/order.service";
import {InformationChatModelInterface, PharmacyOrderChatModelInterface} from "../schemas/adminChatSchema";
import {AdminChatStatus} from "../admin-chat/types/enum";
import {UserRole} from "../common/enum.common";
import {AdminChatService} from "../admin-chat/admin-chat.service";
import {AdminService} from "../admin/admin.service";
import {AdminChatPaginationDTO, AdminMessage, UserClickedDto} from "../users/types/dto/user.dto";
import {Buckets} from "../helpers/interfaces/aws.helper.interface";
import {AdminChatMessageSchemaInterface} from "../schemas/adminChatMessage.schema";
import {PaginationResponse} from "../common/responses.common";
import {ResponseUtils} from "../helpers/utils/response.utils";
import {NotificationsService} from "../notifications/notifications.service";

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class PharmacyService {
  constructor(
    @InjectModel('Pharmacy')
    private readonly pharmacyModel: Model<PharmacyModelStructure>,
    @InjectModel('Login')
    private readonly loginModel: Model<LoginModelStructure>,
    private readonly addressHelper: AddressHelper,
    private readonly googleMapsHelper: GoogleMapsHelper,
    private readonly bucketService: BucketService,
    @Inject(forwardRef(() => OrderHelper))
    private readonly orderHelper: OrderHelper,
    private readonly errorUtils: ErrorUtils,
    private readonly orderService: OrderService,
    private readonly adminChatService: AdminChatService,
    private readonly adminService: AdminService,
    private readonly responseUtils: ResponseUtils,
    private readonly notificationsService: NotificationsService
  ) {
  }

  parseDistanceMatrix(distanceMatrix: DistanceMatrixResponse, destinations: any[], pharmacies: PharmacyModelInterface[]): PharmacyMatrixArray[] {
    let matrixToArray: PharmacyMatrixArray[] = [];
    distanceMatrix.data.rows.map((row, index) => {
      const pharm = row.elements.map((elem, index) => {
        if (elem.status === 'OK') {
          const pharmacyId = destinations[index]?.id;
          const pharmacy = pharmacies.find(pharmacy => pharmacy['_id'].toString() === pharmacyId);
          return {...pharmacy, route: elem};
        }
      });
      matrixToArray = [...matrixToArray, ...pharm];
    });
    return matrixToArray.filter(Boolean);
  }

  async save(pharmacy: CreatePharmacyDTO): Promise<PharmacyModelStructure> {
    try {
      console.log(pharmacy);
      const address = this.addressHelper.transformAddressFromDTO(pharmacy.address);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pharmacy.address = address;
      return (await new this.pharmacyModel(pharmacy).save()).toObject();
    } catch (e) {
      console.warn(e);
    }
  }

  async getPharmacyById(id: string): Promise<PharmacyModelInterface> {
    return this.pharmacyModel.findOne({_id: id}).lean();
  }

  async getPharmacy(id: string, userId: string): Promise<any> {
    const user: LoginModelInterface = await this.loginModel.findOne({_id: userId}).lean();
    const pharmacy = await this.pharmacyModel.findOne({_id: id}).lean();
    return {...pharmacy, email: user.userName}
  }

  async getNearBy(coordinate: string, radius: number): Promise<Array<PharmacyModelInterface>> {
    try {
      const coordinates = Array.from((coordinate as string).split(','), Number).reverse();
      const pharmacies: PharmacyModelStructure[] = await this.pharmacyModel.find({
        'address.location': {
          $near: {
            $geometry: {type: 'Point', coordinates},
            $minDistance: 0,
            $maxDistance: radius,
          },
        },
      }).lean();

      return pharmacies;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * sortByNearest is $geoNear
   * @param pharmacyIds
   * @param coordinates
   */
  async sortByNearest(pharmacyIds: string[], coordinates: number[], radius: number): Promise<NearestPharmacyInterface[]> {
    return this.pharmacyModel.aggregate([
      {
        $geoNear: {
          near: {type: 'Point', coordinates},
          distanceField: 'dist.calculated',
          query: {_id: {$in: pharmacyIds.map(id => ObjectId(id))}},
          includeLocs: 'dist.location',
          spherical: true,
          key: 'address.location',
          // maxDistance: radius,
        },
      },
    ]);
  }

  async getNearByPharmacies(coordinates: string, radius = 10000): Promise<any> {
    try {
      // this returns the on the basis of straight line distance (directed distance)
      const pharmacies: PharmacyModelInterface[] = await this.getNearBy(coordinates, radius);
      const onlinePharmacies: PharmacyModelInterface[] = _.filter(pharmacies, {isOnline: true})
      return this.shortestRoutes(onlinePharmacies, [coordinates]);
    } catch (e) {
      console.error(e);
    }
  }

  async shortestRoutes(pharmacies: PharmacyModelInterface[], origin: string[]): Promise<any> {

    // calculate the route distance
    const destinations = pharmacies.map(pharmacy => {
      const latLng = pharmacy.address.location.coordinates.slice() // pass by value
      return {
        coordinates: latLng.reverse().join(','),
        id: pharmacy['_id'].toString(),
      }
    });
    // get distanceMatrix
    const distanceMatrix: DistanceMatrixResponse = await this.googleMapsHelper.getDistanceMatrix(destinations.map(dest => dest.coordinates), origin);

    // parse distance matrix and add Pharmacy information
    if (distanceMatrix) {
      const pharmacyMatrixArray = this.parseDistanceMatrix(distanceMatrix, destinations, pharmacies);

      // sort on distance
      return pharmacyMatrixArray?.sort((a, b) => a.route.distance.value - b.route.distance.value);
    }
    return [];
  }

  async patchPharmacy(pharmacyId: string, isOnline: boolean): Promise<PharmacyModelInterface> {
    return this.pharmacyModel.findOneAndUpdate({_id: pharmacyId}, {isOnline}, {new: true})
  }

  async pharmacyOrderAcceptance(body: PharmacyOrderAcceptanceDTO, user: User): Promise<BucketModelInterface> {
    try {
      const {isAccepted, bucketId, priceList, reasons, videos, comments, issues, orderId} = body;
      let bucket = await this.bucketService.getCustomPopulatedBucketById(bucketId, "products.product orderId riderId userId paymentBucket")
      if (_.isEmpty(bucket))
        throw new UnprocessableEntityException('Bucket does not exist')
      if (isAccepted) {
        bucket = await this.orderHelper.pharmacyOrderAccepted(bucket, priceList)
        await this.bucketService.findOneAndUpdate({_id: bucket['_id']}, {issues, comments, videos}, "")
      }
      if (!isAccepted) {
        if (reasons.includes(PharmacyRejectReasons.MEDICINES_NOT_AVAILABLE))
          bucket = await this.orderHelper.pharmacyOrderRemoved(bucket as BucketExtendedModel, BucketStatusEnum.PHARMACY_REJECTED)
        else {
          const order = await this.orderService.proceedWithoutSomeBuckets(orderId, [bucketId], BucketStatusEnum.BUCKET_CANCELLED_BY_PHARMACY_WITH_REASON)
          if (!order.pendingPharmacyConfirmBucket.length)
            await this.notificationsService.sendPaymentNotificationToPatient({
              topic: user['_id'].toString(),
              data: {orderId: order['_id'].toString()},
              collapseKey: order['_id'].toString()
            })
        }
        bucket = await this.bucketService.findOneAndUpdate({_id: bucket['_id']}, {reasons, comments}, "")
      }
      return bucket
    } catch (e) {
      this.errorUtils.errorHandler(e)
    }
  }

  async getPharmacyBucket(bucketId: string, user): Promise<BucketModelInterface> {
    const bucket = await this.bucketService.getCustomPopulatedBucketByObject({
        _id: bucketId,
        pharmacy: user.user.toString()
      },
      "products.product riderId userId cart requestedRiders riderBucket")
    if (_.isEmpty(bucket))
      throw new NotFoundException("Bucket does not belongs to you")
    return bucket
  }

  async getPharmacyBuckets(user: any): Promise<BucketModelInterface[]> {
    try {
      const buckets = await this.bucketService.getCustomStatusPharmacyBuckets(user.user.toString(),
        [BucketStatusEnum.BUCKET_DELIVERED,
          BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY,
          BucketStatusEnum.RIDER_ON_THE_WAY_TO_USER,
          BucketStatusEnum.RIDER_ARRIVED_TO_USER,
          BucketStatusEnum.RIDER_WAITING_FOR_USER,
          BucketStatusEnum.USER_CAME_TO_RIDER_TO_PICK_ORDER,
          BucketStatusEnum.RIDER_ASK_FOR_PAYMENT,
          BucketStatusEnum.RIDER_RECEIVED_PAYMENT])

      return buckets
    } catch (e) {
      console.log(e)
    }
  }

  async getPharmacyTodayStats(user: any, query: StatsQueryDTO): Promise<any> {
    try {
      const forwardBuckets = await this.bucketService.getCurrentDatePharmacyBucketsWithStatus([BucketStatusEnum.BUCKET_TIME_UP], user.user.toString(), query)
      const rejectedBuckets = await this.bucketService.getCurrentDatePharmacyBucketsWithStatus([BucketStatusEnum.PHARMACY_REJECTED], user.user.toString(), query)
      const completedBuckets = await this.bucketService.getCurrentDatePharmacyBucketsWithStatus([BucketStatusEnum.BUCKET_DELIVERED,
        BucketStatusEnum.RIDER_ORDER_PICKED_FROM_PHARMACY,
        BucketStatusEnum.RIDER_ON_THE_WAY_TO_USER,
        BucketStatusEnum.RIDER_ARRIVED_TO_USER,
        BucketStatusEnum.RIDER_WAITING_FOR_USER,
        BucketStatusEnum.USER_CAME_TO_RIDER_TO_PICK_ORDER,
        BucketStatusEnum.RIDER_ASK_FOR_PAYMENT,
        BucketStatusEnum.RIDER_RECEIVED_PAYMENT], user.user.toString(), query)

      return {forwardBuckets, rejectedBuckets, completedBuckets}

    } catch (e) {
      console.log(e)
    }
  }

  async ratePharmacy(pharmacyId: string, rate: number) {
    try {
      const rider = await this.pharmacyModel.findById(pharmacyId)
      if (_.isEmpty(rider))
        throw new NotFoundException('Rider Not found')
      const {rating, ratingCount} = rider
      await rider.update({rating: ((rating * ratingCount) + rate) / (ratingCount + 1), ratingCount: ratingCount + 1})
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async addVideoToBucket(body: BucketVideoDTO, user: User): Promise<BucketModelInterface> {
    try {
      const {bucketId} = body
      const bucket = await this.bucketService.getCustomPopulatedBucketById(body.bucketId, "")
      if (_.isEmpty(bucket))
        throw new NotFoundException('Bucket not found')
      return this.bucketService.findOneAndUpdate({_id: bucketId}, {videos: body.videos}, "")
    } catch (e) {
      throw new e
    }
  }

  async openPharmacyAdminOrderChat(pharmacyOrderChat: AdminPharmacyOrderChatDTO, user: any): Promise<PharmacyOrderChatModelInterface> {
    try {
      const {orderId, bucketId} = pharmacyOrderChat
      const order = await this.orderService.getCustomPopulatedOrderById(orderId, "")
      if (_.isEmpty(order))
        throw new UnprocessableEntityException('Order does not exist')
      if (!(order.allBuckets as string[]).map(bucket => bucket.toString()).includes(bucketId))
        throw new UnprocessableEntityException('Bucket does not belongs to this Order')

      const head = await this.adminChatService.getSingleAdminPharmacyOrderChatByKey({
        order: orderId,
        bucket: bucketId,
        role: UserRole.Pharmacy,
      })
      if (!_.isEmpty(head))
        throw new UnprocessableEntityException('Chat Already exist for this order')

      const admin = await this.adminService.getAdmin()
      const adminPharmacyOrderChat: PharmacyOrderChatModelInterface = {
        adminId: admin['_id'].toString(),
        order: orderId,
        bucket: bucketId,
        role: UserRole.Pharmacy,
        status: AdminChatStatus.PENDING,
        to: user.user.toString(),
        unread: 0
      }
      const chatHead = await this.adminChatService.createAdminPharmacyOrderChat(adminPharmacyOrderChat)
      await this.bucketService.findOneAndUpdate({_id: bucketId}, {adminPharmacyOrderChat: chatHead['_id'].toString()}, '')
      return chatHead
    } catch (e) {
      if (e.status && e.status === 422)
        throw e
    }
  }

  async openAdminInformationChat(user: any, body: UserClickedDto): Promise<InformationChatModelInterface> {
    try {
      const {userClicked} = body
      const adminPharmacyInformationChat = await this.adminChatService.getSingleAdminPharmacyInformationChatByKey({
        role: UserRole.Pharmacy,
        to: user.user.toString(),
        status: AdminChatStatus.PENDING,
      }, "lastAdminMessage")
      if (_.isEmpty(adminPharmacyInformationChat) && userClicked) {
        const admin = await this.adminService.getAdmin()
        const adminInformationChat: InformationChatModelInterface = {
          adminId: admin['_id'].toString(),
          role: UserRole.Pharmacy,
          status: AdminChatStatus.PENDING,
          to: user.user.toString(),
          unread: 0
        }
        return await this.adminChatService.createAdminInformationChat(adminInformationChat)
      }
      return adminPharmacyInformationChat
    } catch (e) {
      console.log(e)
    }
  }

  async saveMessageAdmin(adminMessage: AdminMessage, user: any): Promise<AdminChatMessageSchemaInterface> {
    try {
      const {adminChatId, content, urlBucket} = adminMessage
      const head = await this.adminChatService.getAdminPharmacyOrderChatById(adminChatId)
      if (_.isEmpty(head))
        throw new UnprocessableEntityException('Chat not created with this id')
      const {to} = head
      if (to.toString() !== user.user.toString())
        throw new UnprocessableEntityException('You are not allowed in this chat')

      if (urlBucket)
        for (const _urlBucket of urlBucket) {
          _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
        }
      const message = {
        adminChatId,
        from: user.user.toString(),
        content,
        urlBucket,
        isRead: false
      }
      const savedMessage = await this.adminChatService.createAdminChatMessage(message)
      await this.adminChatService.patchAdminPharmacyOrderChat(adminChatId, {
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
        from: user.user.toString(),
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

  async getConfiguration(user: any): Promise<any> {
    try {
      const adminPharmacyInformationChat = await this.adminChatService.getSingleAdminPharmacyInformationChatByKey({
        role: UserRole.Pharmacy,
        to: user.user.toString(),
        status: AdminChatStatus.PENDING,
      }, "lastAdminMessage")
      return {adminPharmacyInformationChat}
    } catch (e) {
      throw e
    }
  }

}
