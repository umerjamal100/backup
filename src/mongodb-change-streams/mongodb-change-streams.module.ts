import {Module} from '@nestjs/common';
import {MongodbChangeStreamsService} from './mongodb-change-streams.service';
import {TokenProvider} from './helpers/token-provider';
import {SchemasModule} from '../schemas/schemas.module';
import {ConfigModule} from '../config/config.module';
import {DatabaseModule} from '../database/database.module';
import {ConfigService} from '../config/config.service';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {Utils} from './helpers/utils';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    SchemasModule,
  ],
  providers: [
    MongodbChangeStreamsService,
    TokenProvider,
    Utils,
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
})
export class MongodbChangeStreamsModule {
}
