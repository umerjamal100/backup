import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {OrderController} from './order.controller';
import {SchemasModule} from '../../schemas/schemas.module';
import {HelpersModule} from "../../helpers/helpers.module";

@Module({
  imports: [SchemasModule, HelpersModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {
}
