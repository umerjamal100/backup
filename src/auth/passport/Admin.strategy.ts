import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '../../config/config.service';
import {UserRole} from '../../common/enum.common';

// import { jwtConstants } from './constants';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
    });
    console.log(configService.jwtSecret);
  }

  async validate(payload: any) {
    if (payload.rol === UserRole.Administrator)
      return {user: payload.user, role: payload.role};
    else return false;
  }
}