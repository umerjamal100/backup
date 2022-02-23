import {HttpService, Injectable} from '@nestjs/common';
import {Strategy as FacebookOAuthStrategy} from 'passport-facebook';
import {UsersService} from '../../users/users.service';
import {ConfigService} from '../../config/config.service';
import {PassportStrategy} from '@nestjs/passport';
import {FacebookAuthResponseInterface, FBMeInterface} from '../types/interfaces/facebook.interface';
import {AxiosResponse} from 'axios';

@Injectable()
export class FacebookStrategy extends PassportStrategy(FacebookOAuthStrategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {
    super({
      clientID: configService.facebookAppId, //"917352275452523",
      clientSecret: configService.facebookAppSecret, //"ed607e5f3ab236453503918f7287453f",
      scope: ['public_profile', 'email'],
      display: 'page',
      callbackURL: configService.facebookCallBackUrl,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: FacebookAuthResponseInterface, done: any) {
    try {
      // get profile from graph api
      const fbProfile: AxiosResponse<FBMeInterface> = await this.httpService.get(`https://graph.facebook.com/v7.0/me?fields=id,name,first_name,last_name,email,gender&access_token=${accessToken}`).toPromise();
      fbProfile.data['refreshToken'] = refreshToken;
      fbProfile.data['accessToken'] = accessToken;
      const user = await this.usersService.findOrCreateFbProfile(fbProfile.data);
      return user;
    } catch (err) {
      console.log('fb oauth', err);
      return false;
    }
  }
}
