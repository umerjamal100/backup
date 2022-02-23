import {LoginTicket, OAuth2Client} from 'google-auth-library';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '../config/config.service';

const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;

@Injectable()
export class GoogleHelper {
  constructor(
    private readonly configService: ConfigService,
    private readonly googleClient: OAuth2Client,
  ) {
  }

  async googleOauth(accessToken: string): Promise<any> {
    const oauth2Client = new OAuth2();
    // eslint-disable-next-line @typescript-eslint/camelcase
    oauth2Client.setCredentials({access_token: accessToken});
    return google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
  }

  async getUserInfo(accessToken): Promise<any> {
    try {
      const oauth2Client = new OAuth2(this.configService.googleWebClientId, this.configService.googleWebClientSecret);
      // eslint-disable-next-line @typescript-eslint/camelcase
      oauth2Client.setCredentials({access_token: accessToken});
      const oauth2 = await google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });
      console.log(oauth2);
      const user = oauth2.userinfo.get();
      return user;
    } catch (e) {
      console.error(e);
    }
  }

  async verifyIdToken(idToken: string): Promise<LoginTicket> {
    try {
      const user = await this.googleClient.verifyIdToken({
        idToken,
        audience: [this.configService.googleWebClientId, this.configService.googleAndroidClientId, this.configService.googleIosClientId] //["563320240816-dqnv9u0u400n3urlm876ddrv95qd89mr.apps.googleusercontent.com", audience],
      });
      console.log('****', user);
      return user;
    } catch (e) {
      console.error(e);
    }
  }
}