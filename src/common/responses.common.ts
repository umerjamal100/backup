import {ApiModelProperty} from '@nestjs/swagger';
import {HttpStatus} from '@nestjs/common';
import {HttpErrors} from './errors';
import {ErrorMessage, ResponseMessage} from './enum.common';

export class Constraints {
  @ApiModelProperty({example: 'confirmPassword must be longer than or equal to 8 characters'})
  minLength: string;

  @ApiModelProperty({example: 'confirmPassword must be shorter than or equal to 64 characters'})
  maxLength: string;

  @ApiModelProperty({example: 'confirmPassword must be equal to password!'})
  passwordMatch: string;
}

export class InvalidRequestMessage {
  @ApiModelProperty({example: 'RequestObject'})
  target: object;

  @ApiModelProperty({example: 'value'})
  value: string;

  @ApiModelProperty({example: 'confirmPassword'})
  property: string;

  @ApiModelProperty({example: '[]'})
  children: string;

  @ApiModelProperty({type: Constraints})
  constraints: object;
}

export class BadRequest {
  @ApiModelProperty({example: HttpStatus.BAD_REQUEST})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.BAD_REQUEST})
  error: string;
}

export class UnauthorizedResponse {
  @ApiModelProperty({example: HttpStatus.UNAUTHORIZED})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.UNAUTHORIZED})
  error: string;
}

export class AuthFailedWithInvalidCreds extends UnauthorizedResponse {
  @ApiModelProperty({example: 'Invalid Credentials!'})
  message: string;
}

export class GenericUnauthorizedResponse extends UnauthorizedResponse {
  @ApiModelProperty({example: 'Session Expired! Please login again!'})
  message: string;
}

export class ForbiddenResponse {
  @ApiModelProperty({example: HttpStatus.FORBIDDEN})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.FORBIDDEN})
  error: string;
}

export class Conflict {
  @ApiModelProperty({example: HttpStatus.CONFLICT})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.CONFLICT})
  error: string;

  @ApiModelProperty({example: 'Account with given email already exists!'})
  message: string;
}

export class UnsupportedMediaTypeResponse {
  @ApiModelProperty({example: HttpStatus.UNSUPPORTED_MEDIA_TYPE})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.UNSUPPORTED_MEDIA_TYPE})
  error: string;
}

export class ValidationBadRequest extends BadRequest {
  @ApiModelProperty({isArray: true, type: InvalidRequestMessage})
  message: object[];
}

export class BadRequestWithUnexpectedMessageField extends BadRequest {
  @ApiModelProperty({example: 'Unexpected field'})
  message: string;
}

export class InternalServerError {
  @ApiModelProperty({example: HttpStatus.INTERNAL_SERVER_ERROR})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.INTERNAL_SERVER_ERROR})
  error: string;
}

export class UnsupportedMediaTypeWithMessage extends UnsupportedMediaTypeResponse {
  @ApiModelProperty({example: 'Allowed Media Types: image/png,image/jpg,image/jpeg'})
  message: string;
}

export class NotFound {
  @ApiModelProperty({example: HttpStatus.NOT_FOUND})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.NOT_FOUND})
  error: string;
}

export class NotFoundWithMessage extends NotFound {
  @ApiModelProperty({example: 'User not found!'})
  message: string;
}

export class InternalServerErrorWithMessage extends InternalServerError {
  @ApiModelProperty({example: 'Please try again later!'})
  message: string;
}

export class OKResponse {
  @ApiModelProperty({example: HttpStatus.OK})
  statusCode: number;
}

export class CreatedResponse {
  @ApiModelProperty({example: HttpStatus.CREATED})
  statusCode: number;
}

export class CreatedWithMessageForForgotPassword {
  @ApiModelProperty({example: ResponseMessage.FORGOT_PASSWORD})
  message: string;
}

export class BadRequestForResetPassword extends BadRequest {
  @ApiModelProperty({example: 'Invalid Code!'})
  message: string;
}

export const defaultInternalServerErrorResponse = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  error: HttpErrors.INTERNAL_SERVER_ERROR,
  message: 'Please try again later!',
};

export class NoContent {
  @ApiModelProperty({example: HttpStatus.NO_CONTENT})
  statusCode: number;
}

export class UnprocessableEntityResponse {
  @ApiModelProperty({example: HttpStatus.UNPROCESSABLE_ENTITY})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.UNPROCESSABLE_ENTITY})
  error: string;
}

export class ForbiddenResponseWithMessage extends ForbiddenResponse {
  @ApiModelProperty({example: ErrorMessage.GENERIC_FORBIDDEN})
  message: string;
}

export const defaultForbiddenResponse = {
  statusCode: HttpStatus.FORBIDDEN,
  error: HttpErrors.FORBIDDEN,
  message: ErrorMessage.GENERIC_FORBIDDEN,
};
export const defaultNotFoundResponse = {
  statusCode: HttpStatus.NOT_FOUND,
  error: HttpErrors.NOT_FOUND,
  message: ErrorMessage.GENERIC_NOT_FOUND,
};

class GenericBadRequestConstraint {
  @ApiModelProperty({
    example: '_id must be a mongodb id',
  })
  isMongoId: string;
}

class GenericBadRequestMessage {
  @ApiModelProperty({
    example: 'requestObject',
  })
  target: object;

  @ApiModelProperty({
    example: 'asd',
  })
  value: string;

  @ApiModelProperty({
    example: '_id',
  })
  property: string;

  @ApiModelProperty({
    example: [],
  })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;

  @ApiModelProperty({
    type: GenericBadRequestConstraint,
  })
  constraints: GenericBadRequestConstraint;
}

export class GenericBadRequestResponseForIdCheck extends BadRequest {
  @ApiModelProperty({
    type: GenericBadRequestMessage,
    isArray: true,
  })
  message: GenericBadRequestMessage[];
}

export class DefaultForbiddenResponseDoc {
  @ApiModelProperty({example: ErrorMessage.GENERIC_FORBIDDEN})
  message: string;

  @ApiModelProperty({example: HttpStatus.FORBIDDEN})
  statusCode: number;

  @ApiModelProperty({example: 'Forbidden'})
  error: string;
}

export class DefaultNotFoundResponseDoc {
  @ApiModelProperty({example: ErrorMessage.GENERIC_NOT_FOUND})
  message: string;

  @ApiModelProperty({example: HttpStatus.NOT_FOUND})
  statusCode: number;

  @ApiModelProperty({example: HttpErrors.NOT_FOUND})
  error: string;
}

export class AccessToken {
  @ApiModelProperty({example: 'eyfghjkl.iuytrertyuil.uytrsrtyu'})
  access_token: string;
}

export class PaginationResponse {
  @ApiModelProperty({example: '9876545678'})
  cursor: string | number;

  @ApiModelProperty({example: false})
  hasMore: boolean;

  @ApiModelProperty({
    example: {_id: 876789, name: 'oiuytr'},
    isArray: true,
    description: 'data wil be of any Type',
  })
  data: any[];
}
