import {Injectable, UnprocessableEntityException} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {messaging} from "firebase-admin/lib/messaging";
import DecodedIdToken = admin.auth.DecodedIdToken;
import BatchResponse = messaging.BatchResponse;
import Message = messaging.Message;

@Injectable()
export class FirebaseHelper {
  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const user: DecodedIdToken = await admin.auth().verifyIdToken(idToken);
      console.log(JSON.stringify(user));
      return user;
    } catch (e) {
      console.error(e);
      throw new UnprocessableEntityException()
    }
  }

  async sendSingleNotification(data: Message): Promise<string> {
    try {
      return await admin.messaging().send(data);
    } catch (e) {
      console.error(e);
    }
  }

  async sendMultipleNotification(data: Message[]): Promise<BatchResponse> {
    try {
      return await admin.messaging().sendAll(data);
    } catch (e) {
      console.error(e);
    }
  }
}