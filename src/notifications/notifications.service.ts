import {Injectable} from '@nestjs/common';
import {messaging} from "firebase-admin/lib/messaging";
import {FirebaseHelper} from "../helpers/firebase.helper";
import {BucketModelInterface} from "../schemas/bucket.schema";
import {
  AndroidMessagePriority,
  AndroidNotificationPriority,
  AndroidNotificationVisibility
} from "../helpers/enum/firebase.enum";
import {ClickAction, NotificationsBody, NotificationsTitle} from "./enums/notifications.enum";
import {NotificationData} from "./types/notifications.type";
import Message = messaging.Message;

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseHelper: FirebaseHelper,
  ) {
  }

  async sendBucketsNotificationToPatient(data: NotificationData[]) {
    try {
      const payloads: Message[] = []
      for (const payload of data) {
        const {data, topic, tag, collapseKey} = payload
        payloads.push({
          topic, data,
          android: {
            collapseKey,
            priority: AndroidMessagePriority.high,
            notification: {
              priority: AndroidNotificationPriority.max,
              titleLocKey: NotificationsTitle.BUCKETS,
              bodyLocKey: NotificationsBody.BUCKETS_BODY,
              clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
              tag,
              visibility: AndroidNotificationVisibility.secret,
              sticky: false
            }
          }
        })
      }
      await this.firebaseHelper.sendMultipleNotification(payloads);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendPaymentNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag,collapseKey} = notificationData
      const payload = {
        topic, data,
        android: {
          collapseKey,
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.PATIENT_PAYMENT,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            bodyLocKey: NotificationsBody.PATIENT_PAYMENT_BODY,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendOrderCancelledNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.ORDER_CANCELLED,
            bodyLocKey: NotificationsBody.ORDER_CANCELLED_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendRiderPickedNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.RIDER_PICKED_BUCKET_FROM_PHARMACY,
            bodyLocKey: NotificationsBody.RIDER_PICKED_BUCKET_FROM_PHARMACY_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendRiderArrivedNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.RIDER_ARRIVED_TO_PATIENT,
            bodyLocKey: NotificationsBody.RIDER_ARRIVED_TO_PATIENT_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendBucketPaymentNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.PAY_YOUR_RIDER,
            bodyLocKey: NotificationsBody.PAY_YOUR_RIDER_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendBucketDeliveredNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.BUCKET_DELIVERED,
            bodyLocKey: NotificationsBody.BUCKET_DELIVERED_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendOrderCompleteNotificationToPatient(notificationData: NotificationData) {
    try {
      const {data, topic, tag} = notificationData
      const payload = {
        topic, data,
        android: {
          priority: AndroidMessagePriority.high,
          notification: {
            priority: AndroidNotificationPriority.max,
            titleLocKey: NotificationsTitle.ORDER_COMPLETED,
            bodyLocKey: NotificationsBody.ORDER_COMPLETED_BODY,
            clickAction: ClickAction.FLUTTER_NOTIFICATION_CLICK,
            tag,
            visibility: AndroidNotificationVisibility.secret,
            sticky: false
          }
        }
      }
      await this.firebaseHelper.sendSingleNotification(payload);
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async sendNotificationsToOrderPharmacies(buckets: BucketModelInterface[]): Promise<any> {
    try {
      for (const bucket of buckets) {
        await this.sendNotificationsToPharmacy(bucket, bucket.pharmacy.toString());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async sendNotificationsToPharmacy(order: any, pharmacy: string): Promise<any> {
    try {
      await this.firebaseHelper.sendSingleNotification({
        data: {order: JSON.stringify(order)},
        topic: pharmacy,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async sendNotificationToTopic(topic: string, data: any): Promise<any> {
    try {
      console.log(data);
      const notif = await this.firebaseHelper.sendSingleNotification({
        data: {data: JSON.stringify(data)},
        topic,
      });
      return notif;
    } catch (e) {
      console.error(e);
    }
  }
}
