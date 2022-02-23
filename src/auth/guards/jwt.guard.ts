import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {AuthHelper} from '../../helpers/auth.helper';
import {ExtractJwt} from 'passport-jwt';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const token: string = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const payload = await this.jwtService.verify(token);
    const isBlackListed = await this.authHelper.isTokenBlackListed(token);
    req.user = {user: payload.user, role: payload.role};
    return payload && !isBlackListed && {user: payload.user, role: payload.role};
    // console.log(payload && !isBlackListed && { user: payload.user, role: payload.role });
  }
}