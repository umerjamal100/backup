import {BadRequestException, ExecutionContext, HttpStatus, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {validate} from 'class-validator';
import {SocialLoginDTO} from '../types/dto/auth.dto';
import {HttpErrors} from '../../common/errors';

@Injectable()
export class SocialLoginGuard extends AuthGuard('socialStrategy') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const credentials = new SocialLoginDTO(req.body);
    const errors = await validate(credentials);
    if (errors.length) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: HttpErrors.BAD_REQUEST,
        message: errors,
      });
    }
    const result = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result as boolean;
  }
}
