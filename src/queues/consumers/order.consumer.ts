 import {OnQueueActive, Process, Processor} from '@nestjs/bull';
import {BucketStatusEnum, RiderBucketEnum} from "../../order/types/enums/order.enum";
import {BucketExtendedModel} from "../../schemas/bucket.schema";
import {Job} from 'bull';
import * as _ from 'lodash';
import {OrderService} from "../../order/order.service";
import {OrderHelper} from "../../order/helper/order.helper";
import {BucketService} from "../../order/bucket.service";
import {QueuesService} from "../queues.service";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {OrderModelStructure} from "../../schemas/order.schema";
import {RiderBucketService} from "../../order/riderBucket.service";

@Processor('order')
export class OrderConsumer {

  constructor(
    @InjectModel('Order')
    private readonly orderModel: Model<OrderModelStructure>,
    private readonly orderService: OrderService,
    private readonly orderHelper: OrderHelper,
    private readonly bucketService: BucketService,
    private readonly riderBucketService: RiderBucketService,
    private readonly queuesService: QueuesService,
  ) {
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process('CheckPharmacyHasConfirmed')
  async CheckPharmacyHasConfirmed(job: Job<unknown>) {
    console.log("CheckPharmacyHasConfirmed Job started")
    try {
      const {data} = job;
      const {status} = data as BucketExtendedModel
      const populatedBucket = await this.bucketService.getCustomPopulatedBucketById(data['_id'].toString(), "products.product orderId riderId userId paymentBucket")
      if (_.isEmpty(populatedBucket)) {
        console.log("CheckPharmacyHasConfirmed Job: Bucket not found")
        return
      }
      if (populatedBucket.status !== BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION) {
        return
      }
      await this.orderHelper.pharmacyOrderRemoved(data as BucketExtendedModel, BucketStatusEnum.BUCKET_TIME_UP)
      return {};
    } catch (e) {
      console.error(e)
    }
  }

  @Process('CheckRiderHasConfirmed')
  async CheckRiderHasAccepted(job: Job<unknown>) {
    console.log("CheckRiderHasConfirmed Job started")
    try {
      const {data} = job;
      console.log(data['job'])
      const riderBucket = await this.riderBucketService.findOne({_id: data['riderBucketId']}, {
        path: 'buckets originBucket',
        populate: {path: "products.product orderId userId pharmacy"}
      })

      const returnCases = [RiderBucketEnum.ACCEPTED, RiderBucketEnum.REJECTED, RiderBucketEnum.PICKED, RiderBucketEnum.COMPLETED]
      if (returnCases.includes(riderBucket.status)) {
        return
      }

      if (riderBucket.status === RiderBucketEnum.PENDING) {
        await this.riderBucketService.updateRiderBucket(data['riderBucketId'], {status: RiderBucketEnum.TIME_UP})
        await this.orderHelper.riderBucketRejected(riderBucket, RiderBucketEnum.TIME_UP, ['TIME_UP_BANCHO'])
      }
      return {};
    } catch (e) {
      console.error(e)
    }
  }
}