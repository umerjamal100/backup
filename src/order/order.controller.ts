import {Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {MessagePattern} from '@nestjs/microservices';
import {MESSAGE_PATTERNS} from '../common/constants.common';
import {OrderService} from './order.service';
import {OrderModelInterface} from '../schemas/order.schema';
import {MessageDTO, RemoveBucketsDTO, SubmitOrderDTO} from './types/dto/order.dto';
import {ApiUseTags} from '@nestjs/swagger';
import {AuthenticatedGuard} from '../auth/guards/Authenticated.guard';
import {Roles} from '../auth/decorators/roles.decorator';
import {UserRole} from '../common/enum.common';
import {RolesGuard} from '../auth/guards/roles.guard';
import {
  BucketByStatus,
  BucketDTO,
  BucketIdDTO,
  BucketPatchDTO,
  ChatBucketDTO,
  OrderDTO,
  PharmacyIdDTO,
  RiderBucketDTO
} from 'src/pharmacy/types/dto/pharmacy.dto';
import {PatchNextScheduleOrderDto, ScheduleOrderDto, ScheduleOrderIdDto} from "./types/dto/schedule.order.dto";
import {ScheduledOrderService} from "./scheduledOrder.service";
import {RiderBucketService} from "./riderBucket.service";
import {BucketModelInterface} from "../schemas/bucket.schema";
import {BucketService} from "./bucket.service";
import {RiderBucketModelInterface} from "../schemas/riderBucket.schema";
import {BucketStatusEnum} from "./types/enums/order.enum";
import {OrderHelper} from "./helper/order.helper";
import {ChatBucketService} from "./chatBucket.service";
import {ChatBucketModelInterface} from "../schemas/chatBucket.schema";
import {PaymentBucketService} from "./paymentBucket.service";
import {NotificationsService} from "../notifications/notifications.service";

@ApiUseTags('Order')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderHelper: OrderHelper,
    private readonly riderBucketService: RiderBucketService,
    private readonly scheduledOrderService: ScheduledOrderService,
    private readonly bucketService: BucketService,
    private readonly chatBucketService: ChatBucketService,
    private readonly paymentBucketService: PaymentBucketService,
    private readonly notificationsService: NotificationsService
  ) {
  }

  @MessagePattern(MESSAGE_PATTERNS.CHECKOUT_CART)
  async checkoutCart({cart, user}): Promise<any> {
    return this.orderService.splitOrders(cart, user);
  }


  @UseGuards(AuthenticatedGuard)
  @Post('submit')
  async submitOrders(@Body() body: SubmitOrderDTO): Promise<OrderModelInterface[]> {
    return this.orderService.submitOrders(body);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('myOrdersHistory')
  async getMyOrderHistory(@Req() req): Promise<any> {
    return this.orderService.getOrdersHistory(req.user._id);
  }

  @Get('bucket/:bucketId')
  async getBucketById(@Param() param: BucketDTO): Promise<BucketModelInterface> {
    return this.bucketService.getCustomPopulatedBucketByObject({_id: param.bucketId}, {
      path: "products.product pharmacy riderId prescriptions.prescriptionId userId adminOrderChat adminPharmacyOrderChat orderId",
      populate: {path: 'lastAdminMessage unratedBuckets'},
    })
  }


  @Roles(UserRole.Patient)
  @UseGuards(RolesGuard)
  @Patch('proceedWithoutBucket/:orderId')
  async patchOrder(@Param() param: OrderDTO, @Body() body: RemoveBucketsDTO, @Req() req): Promise<OrderModelInterface> {
    const {bucketId, reasons} = body
    const order = await this.orderService.proceedWithoutSomeBuckets(param.orderId, [body.bucketId], BucketStatusEnum.BUCKET_CANCELLED_BY_USER_WITH_REASON)
    await this.bucketService.findOneAndUpdate({_id: bucketId}, {reasons}, "")
    if (!order.pendingPharmacyConfirmBucket.length)
      await this.notificationsService.sendPaymentNotificationToPatient({
        topic: req.user['_id'].toString(),
        data: {orderId: order['_id'].toString()},
        collapseKey: order['_id'].toString()
      })
    return this.orderService.getCustomPopulatedOrderById(param.orderId, "")
  }

  @Get('riderBucket/:riderBucketId')
  async getRiderBucketById(@Param() param: RiderBucketDTO): Promise<RiderBucketModelInterface> {
    return this.riderBucketService.findOne({_id: param.riderBucketId}, "")
  }

  @Get('chat/')
  async getChatBucketById(@Query() param: ChatBucketDTO): Promise<ChatBucketModelInterface> {
    return this.chatBucketService.findOne({_id: param.ChatBucketId}, "")
  }

  // @Roles(UserRole.Admin)
  // @UseGuards(RolesGuard)
  @Post('orderToPharmacy')
  async sendOrderToPharmacy(@Query() query: PharmacyIdDTO): Promise<boolean> {
    return this.orderService.sendOrderToPharmacy(query.pharmacyId);
  }

  // @Roles(UserRole.Pharmacy)
  // @UseGuards(RolesGuard)
  @Post('acceptedByPharmacy')
  async getPharmacyAcceptedOrders(@Query() query: PharmacyIdDTO): Promise<any> {
    return this.orderService.getPharmacyAcceptedOrders(query.pharmacyId);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Get('status/buckets')
  async getPharmacyOrders(@Query() query: BucketByStatus, @Req() req): Promise<any> {
    return this.orderService.getPharmacyOrders(req.user, query.status);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Patch('bucket')
  async patchOrderBucket(@Body() body: BucketPatchDTO, @Req() req): Promise<any> {
    // only pharmacy can patch its bucket
    return this.orderService.patchPharmacyBucket(body, req.user);
  }

  @Post('bucketSetToProcessing')
  async bucketSetToProcessing(@Body() body: BucketIdDTO): Promise<any> {
    return await this.orderService.bucketSetToProcessing(body.bucketId);
  }

  @Get('running')
  async runningOrders(@Req() req): Promise<any> {
    return await this.orderService.runningOrders(req.user);
  }

  @Get(':orderId')
  async getOrderById(@Param() param: OrderDTO): Promise<OrderModelInterface> {
    return this.orderService.getCustomPopulatedOrderById(param.orderId, {
      path: "buckets adminOrderChat",
      populate: {path: "pharmacy paymentBucket riderId lastAdminMessage"}
    })
  }

  @UseGuards(AuthenticatedGuard)
  @Post('scheduleOrder')
  async scheduleOrder(@Body() body: ScheduleOrderDto, @Req() req) {
    return this.scheduledOrderService.insertOrder({...body, userId: req.user._id})
  }

  @UseGuards(AuthenticatedGuard)
  @Patch('scheduleOrder/:orderId')
  async scheduleNextOrder(@Param() param: ScheduleOrderIdDto, @Body() body: PatchNextScheduleOrderDto, @Req() req) {
    return this.scheduledOrderService.patchNextDate(body, param.orderId, req.user._id)
  }

  @UseGuards(AuthenticatedGuard)
  @Post('sendMessage')
  async saveMessage(@Body() message: MessageDTO, @Req() req) {
    return this.chatBucketService.saveMessage(message, req.user._id)
  }

  @Post('testChat')
  async testChat() {
    this.chatBucketService.create({
      bucket: '5fd35e49aa098e32eccbbb4c',
      messages: [],
    })
  }

  @Post('testSchedule')
  async testSchedule() {
    this.scheduledOrderService.notifyUsers()
  }
}
