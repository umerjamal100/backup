import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from '../auth.service'
import {UserRole} from '../../common/enum.common';
import express = require("express");


@Injectable()
export class VerifyEmailStrategy extends PassportStrategy(Strategy, 'verifyEmail') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'code',
      passReqToCallback: true,
    });
  }

  async validate(req: express.Request, email: string, code: string): Promise<any> {
    const user = await this.authService.verifyEmail({email, code}, req.query?.userType as UserRole);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}