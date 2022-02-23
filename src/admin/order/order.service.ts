import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {OrderModel, OrderModelInterface} from '../../schemas/order.schema';
import {BucketModel, BucketModelInterface} from '../../schemas/bucket.schema';
import {ResponseUtils} from '../../helpers/utils/response.utils';
import {PaginationResponse} from '../../common/responses.common';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order')
    private readonly orderModel: OrderModel,
    @InjectModel('Bucket')
    private readonly bucketModel: BucketModel,
    private readonly responseUtils: ResponseUtils,
  ) {
  }

  async getCustomPopulatedOrderById(orderId: string, populate: any): Promise<OrderModelInterface> {
    try {
      const order = await this.orderModel.findById(orderId).populate(populate).lean()
      return order
    } catch (e) {
      console.log(e)
    }
  }

  async getCustomPopulatedBucketById(_id: string, populated: any): Promise<BucketModelInterface> {
    try {
      const bucket = await this.bucketModel.findOne(
        {_id}).populate(populated).lean();
      return bucket
    } catch (e) {
      console.error(e);
    }
  }

  async findInDateRangeAndGroupByStatus(to: string, from: string) {
    return this.orderModel.findInDateRangeAndGroupByField('status', to, from);
  }

  async findInDateRangeAndGroupByPaymentTypes(to: string, from: string) {
    return this.orderModel.findInDateRangeAndAggregatedHourly(to, from);
  }

  async getCardsData(to: string, from: string) {
    const orderCards = await this.orderModel.findOrderCardsInDateRange(to, from);
    const bucketCards = await this.bucketModel.findBucketCardsInDateRange(to, from);
    return {orderCards: orderCards[0], bucketCards: bucketCards[0], scheduledOrders: 'mocked'};
  }

  async getOrderCards(to: string, from: string) {
    const orderCards = await this.orderModel.findOrderCardsInDateRange(to, from);
    return orderCards[0];
  }

  async getOrderTable({limit, status, from, to, ...other}): Promise<PaginationResponse> {
    const orders = await this.orderModel
      .find({
        $and: [
          {
            ...(from &&
              to && {
                createdAt: {
                  $gte: from,
                  $lte: to,
                },
              }),
          },
          {
            ...(status && {status}),
          },
        ],
      })
      .skip(Number(other.cursor) ?? 0)
      .limit(limit + 1)
      .lean();

    const totalCount = await this.orderModel.find({}).count();

    /** order has type OrderTableInterface */
    return this.responseUtils.offsetPaginationResponse(
      orders.map((o) => {
        // @ts-ignore
        const {_id, ...to} = o.to;
        return {...o, ...to, to: null}
      }),
      limit,
      Number(other.cursor) || 1 * limit,
      totalCount,
    );
  }
}
