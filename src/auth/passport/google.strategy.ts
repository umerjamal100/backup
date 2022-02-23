import {Injectable} from '@nestjs/common';
import {UsersService} from '../../users/users.service';
import {ConfigService} from '../../config/config.service';
import {Strategy as GoogleOAuth2Strategy} from 'passport-google-oauth20';
import {PassportStrategy} from '@nestjs/passport';
import {GoogleInterface} from '../types/interfaces/google.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleOAuth2Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.googleWebClientId, //"917352275452523",
      clientSecret: configService.googleWebClientSecret, //"ed607e5f3ab236453503918f7287453f",
      passReqToCallback: true,
      scope: ['profile', 'email'],
      callbackURL: configService.googleWebClientCallbackUrl,
    })
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: GoogleInterface, done: any) {
    try {
      console.log(profile);
      profile['refreshToken'] = refreshToken;
      profile['accessToken'] = accessToken;
      const user = await this.usersService.findOrCreateGoogleProfile(profile._json);
      return user;
    } catch (err) {
      console.log('google auth', err);
      return false;
    }
  }
}
