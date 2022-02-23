import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ScheduledOrderInterface, ScheduledOrderModelStructure,} from '../schemas/scheduledOrderSchema';
import {Model} from 'mongoose';
import {CartService} from '../cart/cart.service';
import {User} from '../schemas/interfaces/user.interface';
import {CartCheckoutInterface} from '../cart/types/interfaces/cart.interface';
import {OrderService} from './order.service';
import {Cron, CronExpression} from '@nestjs/schedule/dist';
import {PatchNextScheduleOrderDto, ScheduleIntervalEnum} from './types/dto/schedule.order.dto';
import * as moment from 'moment';
import {FirebaseHelper} from '../helpers/firebase.helper';

@Injectable()
export class ScheduledOrderService {
  constructor(
    @InjectModel('ScheduledOrder')
    private readonly scheduledOrderModel: Model<ScheduledOrderModelStructure>,
    private readonly cartService: CartService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly firebaseHelper: FirebaseHelper,
  ) {
  }

  async insertOrder(
    data: ScheduledOrderInterface,
    toObject = true,
  ): Promise<ScheduledOrderModelStructure | ScheduledOrderInterface> {
    try {
      const inserted = await this.scheduledOrderModel.create(data);
      if (toObject) return inserted.toObject();
      else return inserted;
    } catch (e) {
      console.log(e);
    }
  }

  async patchNextDate(data: PatchNextScheduleOrderDto, orderId: string, userId: string) {
    try {
      const patched = await this.scheduledOrderModel.findOneAndUpdate(
        {userId, _id: orderId},
        // @ts-ignore
        {$set: {...data}},
      );
      return patched
    } catch (e) {
      //
    }
  }

  async todayOrders() {
    const todayOrders = await this.getTodayOrders();

    /** map orders to checkout cart */
    const carts = todayOrders.map((order) => ({cartId: order.cartId, user: order.userId}));

    /** submit carts */
    const cartsSubmitted = await this.submitCarts(carts);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async getTodayOrders(): Promise<any> {
    const start = (new Date() as unknown) as any;
    start.setHours(0, 0, 0, 0);

    const end = (new Date() as unknown) as any;
    end.setHours(23, 59, 59, 999);
    return this.scheduledOrderModel
      .find({
        nextDate: {
          $gte: start,
          $lt: end,
        },
        scheduleInterval: ScheduleIntervalEnum.DAILY,
      })
      .populate({path: 'userId', model: 'User'})
      .lean();
  }

  async submitCarts(carts: Array<{cartId: string; user: User}>) {
    /** create promises for all carts */
    const submittingCarts = carts.map((cart) =>
      this.cartService.confirmCart(cart.cartId, cart.user),
    );
    /** one faulty cart might be the cause to fail all other carts. because Promise.all works that way*/
    const submittedCarts: CartCheckoutInterface[] = await Promise.all(submittingCarts);

    /** prepare payload to submit buckets created after cart checkout*/
    const submittingSplitOrdersPayload = submittedCarts.map((cart) => ({
      subOrdersIds: cart.buckets.map((b) => b._id.toString()),
      orderId: cart.orderId,
    }));

    /** create promise for submitting orders*/
    const submittingOrders = submittingSplitOrdersPayload.map((o) =>
      this.orderService.submitOrders(o),
    );

    /** order submission complete*/
    const submittedOrders = await Promise.all(submittingOrders);
  }

  // push notification on every monday
  @Cron('0 9 * * MON')
  /**
   * notify users whose orders are pending this week
   */
  async notifyUsers() {
    const thisWeekOrders = await this.getOrdersOfCurrentWeek();

    for (const order of thisWeekOrders) {
      /** notification payload */
      const notification = {
        topic: order.userId,
        notification: {
          body: 'do you want to schedule order',
        },
        data: {payload: JSON.stringify(order)},
      };
      /** send notification with fcm*/
      this.firebaseHelper.sendSingleNotification(notification);
    }
  }

  async getOrdersOfCurrentWeek() {
    const today = moment();
    const from_date = today.startOf('week').toDate() as any;
    const to_date = today.endOf('week').toDate() as any;

    const weeklyOrders = await this.scheduledOrderModel.find({
      nextDate: {
        $gte: from_date,
        $lt: to_date,
      },
      isValid: true as any,
    });

    return weeklyOrders;
  }
}
