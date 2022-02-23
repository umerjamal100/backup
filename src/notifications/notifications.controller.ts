import {Body, Controller, Post} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {MirrorDTO} from './dto/create-notification.dto';
import {ApiUseTags} from "@nestjs/swagger";
import {FirebaseHelper} from "../helpers/firebase.helper";

@ApiUseTags('Notification')
@Controller('notification')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly firebaseHelper: FirebaseHelper,
  ) {
  }

  //mock
  @Post('mirror')
  async mirrorNotification(@Body() body: MirrorDTO): Promise<any> {
    // only pharmacy can patch its bucket
    return await this.firebaseHelper.sendSingleNotification(body);
  }
}
