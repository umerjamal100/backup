import {forwardRef, Module} from '@nestjs/common';
import {QueuesService} from "./queues.service";
import {BullModule} from "@nestjs/bull";
import {HelpersModule} from "../helpers/helpers.module";
import {OrderConsumer} from "./consumers/order.consumer";
import {DoneCallback, Job} from "bull";
import {OrderModule} from "../order/order.module";
import {OrderHelper} from "../order/helper/order.helper";
import {SchemasModule} from "../schemas/schemas.module";
import {RiderService} from "../rider/rider.service";
import {PharmacyService} from "../pharmacy/pharmacy.service";
import {PaymentBucketService} from "../order/paymentBucket.service";
import {RiderBucketService} from "../order/riderBucket.service";
import {AdminChatModule} from "../admin-chat/admin-chat.module";
import {AdminModule} from "../admin/admin.module";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    BullModule.registerQueue({
      name: 'order',
      processors: [(job: Job, done: DoneCallback) => {
        done(null, job.data);
      }],
    }),
    HelpersModule,
    forwardRef(() => OrderModule),
    forwardRef(() => AdminChatModule),
    forwardRef(() => AdminModule),
    NotificationsModule
  ],
  providers: [QueuesService, OrderConsumer, OrderHelper, RiderService, PharmacyService, PaymentBucketService, RiderBucketService],
  exports: [QueuesService],
})
export class QueuesModule {
}
