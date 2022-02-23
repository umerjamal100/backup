import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {SchemasModule} from './schemas/schemas.module';
import {HelpersModule} from './helpers/helpers.module';
import {DatabaseModule} from './database/database.module';
import {RedisModule} from 'nestjs-redis';
import {ConfigService} from './config/config.service';
import {JwtModule} from '@nestjs/jwt';
import {UsersModule} from './users/users.module';
import {MediaModule} from './media/media.module';
import {PharmacyModule} from './pharmacy/pharmacy.module';
import {ProductModule} from './product/product.module';
import {MICRO_SERVICE_INJECTION_TOKEN} from './common/constants.common';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {DocumentService} from './document/document.service';
import {DocumentModule} from './document/document.module';
import {EventsGatewayModule} from './events-gateway/events-gateway.module';
import {PrescriptionModule} from './prescription/prescription.module';
import {CartModule} from './cart/cart.module';
import {OrderModule} from './order/order.module';
import {BullModule} from "@nestjs/bull";
import {QueuesModule} from './queues/queues.module';
import {RiderModule} from './rider/rider.module';
import {AdminModule} from './admin/admin.module';
import { AdminChatModule } from './admin-chat/admin-chat.module';
import { PromotionsModule } from './promotions/promotions.module';
import { NotificationsModule } from './notifications/notifications.module';

// TODO provide user Schema here
@Module({
  imports: [AuthModule, SchemasModule, HelpersModule, DatabaseModule,
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({url: configService.redisUri}),
    }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {expiresIn: '60d'},
      }),
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    UsersModule,
    MediaModule,
    PharmacyModule,
    ProductModule,
    EventsGatewayModule,
    DocumentModule,
    PrescriptionModule,
    CartModule,
    OrderModule,
    QueuesModule,
    RiderModule,
    AdminModule,
    AdminChatModule,
    PromotionsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: MICRO_SERVICE_INJECTION_TOKEN.ELASTIC_SEARCH,
      useFactory: (config: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: config.elasticSearchMicroServicePort,
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: MICRO_SERVICE_INJECTION_TOKEN.ELASTIC_SEARCH,
      useFactory: (config: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: config.elasticSearchMicroServicePort,
          },
        });
      },
      inject: [ConfigService],
    },
    DocumentService,
  ],
})
export class AppModule {
}
