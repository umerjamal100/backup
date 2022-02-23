import {forwardRef, Module} from '@nestjs/common';
import {ProductService} from './product.service';
import {ProductController} from './product.controller';
import {SchemasModule} from '../schemas/schemas.module';
import {HelpersModule} from '../helpers/helpers.module';
import {ConfigService} from '../config/config.service';
import {MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {PharmacyModule} from '../pharmacy/pharmacy.module';

@Module({
  imports: [
    SchemasModule,
    forwardRef(() => HelpersModule),
    forwardRef(() => PharmacyModule),
  ],
  providers: [
    ProductService,
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
  ],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {
}
