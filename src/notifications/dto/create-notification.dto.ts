import {ApiModelProperty} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";
import {messaging} from "firebase-admin/lib/messaging";
import {
  AndroidMessagePriority,
  AndroidNotificationPriority,
  AndroidNotificationVisibility
} from "../../helpers/enum/firebase.enum";
import AndroidConfig = messaging.AndroidConfig;
import Notification = messaging.Notification

export class CreateNotificationDto {
}

export class MirrorDTO {
  @ApiModelProperty({example: 'topic'})
  @IsString()
  @IsOptional()
  topic: string;

  @ApiModelProperty({example: 'token'})
  @IsString()
  @IsOptional()
  token: string;

  @ApiModelProperty({example: {title: 'title', body: 'body', imageUrl: 'url'}})
  @IsOptional()
  notification?: Notification;

  @ApiModelProperty({example: {}})
  @IsOptional()
  data?: any;

  @ApiModelProperty({
    example: {
      collapseKey: 'collapseKey',
      priority: AndroidMessagePriority.high,
      ttl: 5000,
      restrictedPackageName: '',
      notification: {
        title: 'title',
        body: 'body',
        imageUrl: 'imageUrl',
        icon: 'Icon resource for the Android notification.',
        color: '',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        priority: AndroidNotificationPriority.max,
        tag: 'tag',
        ticker: 'ticker',
        titleLocKey: 'titleLocKey',
        bodyLocKey: 'bodyLocKey',
        visibility: AndroidNotificationVisibility.secret,
        notificationCount: 5,
        sticky: true
      }
    }
  })
  @IsOptional()
  android?: AndroidConfig;
}