import {forwardRef, Module} from '@nestjs/common';
import {CartService} from './cart.service';
import {CartController} from './cart.controller';
import {SchemasModule} from '../schemas/schemas.module';
import {HelpersModule} from '../helpers/helpers.module';
import {MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ConfigService} from '../config/config.service';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {CartHelper} from './helpers/cart.helper';

@Module({
  imports: [
    SchemasModule,
    forwardRef(() => HelpersModule),
  ],
  providers: [
    CartHelper,
    CartService,
    {
      provide: MICRO_SERVICE_INJECTION_TOKEN.ORDER,
      useFactory: (config: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: config.orderMicroServicePort,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {
}
