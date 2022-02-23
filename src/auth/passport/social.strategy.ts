import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from '../auth.service'

@Injectable()
export class SocialStrategy extends PassportStrategy(Strategy, 'socialStrategy') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'idToken', // just ignore
      passwordField: 'provider', // just ignore
      passReqToCallback: true,
    });
  }

  async validate(req): Promise<any> {
    const user = await this.authService.socialLogin(req.body as any);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}