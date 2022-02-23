import {forwardRef, Module} from '@nestjs/common';
import {PharmacyService} from './pharmacy.service';
import {PharmacyController} from './pharmacy.controller';
import {SchemasModule} from '../schemas/schemas.module';
import {AuthModule} from '../auth/auth.module';
import {HelpersModule} from '../helpers/helpers.module';
import {OrderModule} from "../order/order.module";
import {AdminChatModule} from "../admin-chat/admin-chat.module";
import {AdminService} from "../admin/admin.service";
import {NotificationsModule} from "../notifications/notifications.module";

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    forwardRef(() => AuthModule),
    forwardRef(() => HelpersModule),
    forwardRef(() => OrderModule),
    forwardRef(() => AdminChatModule),
    NotificationsModule
  ],
  providers: [PharmacyService, AdminService],
  controllers: [PharmacyController],
  exports: [PharmacyService],
})
export class PharmacyModule {
}
