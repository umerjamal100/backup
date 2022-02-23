import {forwardRef, MiddlewareConsumer, Module} from '@nestjs/common';
import {OrderController} from './order.controller';
import {OrderService} from './order.service';
import {SchemasModule} from '../schemas/schemas.module';
import {ProductModule} from '../product/product.module';
import {ConfigModule} from '../config/config.module';
import {DatabaseModule} from '../database/database.module';
import {RedisModule} from 'nestjs-redis';
import {ConfigService} from '../config/config.service';
import {OrderHelper} from './helper/order.helper';
import {HelpersModule} from '../helpers/helpers.module';
import {SubOrdersCacheMiddleware} from './middlewares/SubOrdersCache.middleware';
import {CartModule} from '../cart/cart.module';
import {BucketService} from './bucket.service';
import {BucketHelper} from './helper/bucket.helper';
import {QueuesModule} from "../queues/queues.module";
import {ErrorUtils} from "../helpers/utils/error.utils";
import {RiderService} from "../rider/rider.service";
import {PharmacyModule} from "../pharmacy/pharmacy.module";
import {PaymentBucketService} from "./paymentBucket.service";
import {RiderBucketService} from "./riderBucket.service";
import {ScheduledOrderService} from "./scheduledOrder.service";
import {ScheduleModule} from "@nestjs/schedule/dist";
import {PharmacyService} from "../pharmacy/pharmacy.service";
import {RiderModule} from "../rider/rider.module";
import {ChatBucketService} from "./chatBucket.service";
import {AdminChatModule} from "../admin-chat/admin-chat.module";
import {AdminModule} from "../admin/admin.module";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    SchemasModule,
    ConfigModule,
    DatabaseModule,
    forwardRef(() => ProductModule),
    forwardRef(() => HelpersModule),
    forwardRef(() => PharmacyModule),
    forwardRef(() => CartModule),
    forwardRef(() => RiderModule),
    forwardRef(() => AdminChatModule),
    forwardRef(() => AdminModule),
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({url: configService.redisUri}),
    }),
    QueuesModule,
    PharmacyModule,
    NotificationsModule
  ],
  controllers: [OrderController],
  providers: [OrderService, ScheduledOrderService, OrderHelper, BucketService, BucketHelper, ErrorUtils, RiderService, PaymentBucketService, RiderBucketService, PharmacyService, ChatBucketService],
  exports: [OrderService, ScheduledOrderService, BucketService, OrderHelper, RiderBucketService, ChatBucketService]
})
export class OrderModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SubOrdersCacheMiddleware)
    // .forRoutes({path: 'acceptance', method: RequestMethod.POST});
  }
}
