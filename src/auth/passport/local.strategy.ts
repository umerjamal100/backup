import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from '../auth.service';
import {User} from '../../schemas/interfaces/user.interface';
import {HttpErrors} from '../../common/errors';
import {UserRole} from '../../common/enum.common';
import express = require('express');

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: express.Request, username: string, password: string): Promise<User> {
    const user = await this.authService.login({username, password}, req.params['userRole'] as UserRole);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: HttpErrors.UNAUTHORIZED,
        message: 'Invalid Credentials!',
      });
    }
    return user;
  }
}
