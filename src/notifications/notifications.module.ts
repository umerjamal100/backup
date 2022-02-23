import {forwardRef, Module} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {NotificationsController} from './notifications.controller';
import {HelpersModule} from "../helpers/helpers.module";

@Module({
  imports: [
    forwardRef(() => HelpersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {
}
