import {Injectable} from '@nestjs/common';
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {StringUtils} from "../helpers/utils/string.utils";
import {BucketModelInterface, TimeStampInterface} from "../schemas/bucket.schema";
import * as moment from "moment"

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue('order')
    private order: Queue,
    private readonly stringUtils: StringUtils
  ) {
  }

  async pharmacyWaitingOrder(data: BucketModelInterface): Promise<TimeStampInterface> {
    const PharmacyTimeConstant = 20 //Constants
    const currentTime = moment.duration(moment().unix(), 's').asMilliseconds().toString()
    const expireTime = moment.duration(moment().unix(), 's').add(moment.duration(PharmacyTimeConstant, 'm')).asMilliseconds().toString()
    const timeStamp: TimeStampInterface = {
      startTime: currentTime,
      expireTime,
      TimeConstant: PharmacyTimeConstant
    }
    const delay = this.stringUtils.delay(PharmacyTimeConstant)
    await this.order.add('CheckPharmacyHasConfirmed', data, {delay})
    return timeStamp
  }

  async CheckRiderHasConfirmedJob(data: any) {
    const RiderTimeConstant = 10 //Constants
    const currentTime = moment.duration(moment().unix(), 's').asMilliseconds().toString()
    const expireTime = moment.duration(moment().unix(), 's').add(moment.duration(RiderTimeConstant, 'm')).asMilliseconds().toString()
    const timeStamp: TimeStampInterface = {
      startTime: currentTime,
      expireTime,
      TimeConstant: RiderTimeConstant
    }
    const delay = this.stringUtils.delay(RiderTimeConstant)
    await this.order.add('CheckRiderHasConfirmed', data, {delay})
    return timeStamp
  }

}
