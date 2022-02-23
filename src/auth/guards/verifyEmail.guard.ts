import {BadRequestException, ExecutionContext, HttpStatus, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {validate} from 'class-validator';
import {VerifyEmailDTO} from '../types/dto/auth.dto';
import {HttpErrors} from '../../common/errors';
import express = require('express');

@Injectable()
export class VerifyEmailGuard extends AuthGuard('verifyEmail') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: express.Request = context.switchToHttp().getRequest();
    const credentials = new VerifyEmailDTO({...req.body, userType: req.query?.userType});
    const errors = await validate(credentials);
    if (errors.length) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: HttpErrors.BAD_REQUEST,
        message: errors,
      });
    }
    const result: boolean = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}
