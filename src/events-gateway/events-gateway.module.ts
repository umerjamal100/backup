import {forwardRef, Module} from '@nestjs/common';
import {EventsGatewayService} from './events-gateway.service';
import {EventsHelper} from './helpers/socket.helper';
import {MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ConfigService} from '../config/config.service';
import {ClientProxyFactory, Transport} from '@nestjs/microservices';
import {SchemasModule} from '../schemas/schemas.module';
import {AdminChatModule} from "../admin-chat/admin-chat.module";

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    forwardRef(() => AdminChatModule),
  ],
  providers: [EventsGatewayService, EventsHelper,
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
export class EventsGatewayModule {
}
