import {ScheduleIntervalEnum} from "../order/types/dto/schedule.order.dto";
import * as mongoose from "mongoose";
import {Document} from "mongoose";

export interface ScheduledOrderInterface {
  userId: string;
  cartId: string;
  nextDate: string; // date of next order
  isValid?: string
  scheduleInterval: ScheduleIntervalEnum,
}

export type PartialScheduledOrderInterface = Partial<ScheduledOrderInterface>;

export interface ScheduledOrderModelStructure extends ScheduledOrderInterface, Document {
}

export const ScheduledOrderSchema = new mongoose.Schema({
  userId: {type: String},
  cartId: {type: String, ref: 'Cart'},
  nextDate: {type: Date},
  isValid: {type: Boolean, default: true},
  scheduleInterval: {type: String, enum: Object.values(ScheduleIntervalEnum)}
})