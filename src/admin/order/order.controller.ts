import {Controller, Get, Query, Req} from '@nestjs/common';
import {OrderService} from './order.service';
import {BucketIdDTO, GroupByStatusDto, OrderIdDTO, PaginationDto} from './dto/group-by-status.dto';
import {ApiUseTags} from '@nestjs/swagger';
import {PaginationResponse} from '../../common/responses.common';
import {OrderModelInterface} from "../../schemas/order.schema";
import {BucketModelInterface} from "../../schemas/bucket.schema";

@ApiUseTags('Admin')
@Controller('admin/orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {
  }

  @Get('groupByStatus')
  async findInDateRangeAndGroupByStatus(@Query() query: GroupByStatusDto, @Req() {user}) {
    const data = await this.orderService.findInDateRangeAndGroupByStatus(query.to, query.from);
    return data.reduce((d, c) => {
      if (d[c._id.month]?.length)
        d[c._id.month] = [...d[c._id.month], {status: c._id.status, count: c.count}];
      else d[c._id.month] = [{status: c._id.status, count: c.count}];
      return d;
    }, {});
  }

  @Get('groupByPaymentsType')
  async findInDateRangeAndGroupByPaymentTypes(@Query() query: GroupByStatusDto, @Req() {user}) {
    const data = await this.orderService.findInDateRangeAndGroupByPaymentTypes(
      query.to,
      query.from,
    );
    return data.reduce((d, c) => {
      if (d[c._id.day]?.length)
        d[c._id.day] = [...d[c._id.day], {type: c._id.type, count: c.count}];
      else d[c._id.day] = [{type: c._id.type, count: c.count}];
      return d;
    }, {});
  }

  @Get('homeCards')
  async getHomeCards(@Query() query: GroupByStatusDto, @Req() {user}) {
    return await this.orderService.getCardsData(query.to, query.from);
  }

  @Get('cards')
  async getOrderCards(@Query() query: GroupByStatusDto, @Req() {user}) {
    return this.orderService.getOrderCards(query.to, query.from);
  }

  @Get('table')
  async getOrderTable(@Query() query: PaginationDto, @Req() {user}): Promise<PaginationResponse> {
    return this.orderService.getOrderTable(query);
  }

  @Get('order/:id')
  async getSingleOrder(@Req() {user}, @Query() query: OrderIdDTO): Promise<OrderModelInterface> {
    return this.orderService.getCustomPopulatedOrderById(query.id, {
      path: "pendingPharmacyConfirmBucket allBuckets buckets cancelledBuckets notifiedBuckets orderPlacedBy",
      populate: {path: "products.product pharmacy"}
    });
  }

  @Get('bucket/')
  async getSingleBucket(@Req() {user}, @Query() query: BucketIdDTO): Promise<BucketModelInterface> {
    return this.orderService.getCustomPopulatedBucketById(query.id, {
      path: "products.product pharmacy prescriptions.prescriptionId paymentBucket",
    });
  }

}
