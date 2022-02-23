import {BadRequestException, ExecutionContext, HttpStatus, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {validate} from 'class-validator';
import {VerifyPhoneDTO} from '../types/dto/auth.dto';
import {HttpErrors} from '../../common/errors';

@Injectable()
export class VerifyPhoneGuard extends AuthGuard('verifyPhone') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const credentials = new VerifyPhoneDTO(req.body);
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
