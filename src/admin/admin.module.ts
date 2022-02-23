import {Module} from '@nestjs/common';
import {AdminService} from './admin.service';
import {AdminController} from './admin.controller';
import {SchemasModule} from "../schemas/schemas.module";
import {HelpersModule} from "../helpers/helpers.module";
import {OrderModule} from './order/order.module';
import {RiderModule} from "./rider/rider.module";
import {AdminPharmacyModule} from './admin-pharmacy/admin-pharmacy.module';
import {AdminChatModule} from "../admin-chat/admin-chat.module";

@Module({
  imports: [SchemasModule, HelpersModule, OrderModule, RiderModule, AdminPharmacyModule, AdminChatModule],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService]
})
export class AdminModule {
}
