import {ApiModelProperty} from '@nestjs/swagger';
import {HttpStatus} from '@nestjs/common';
import {BadRequest, UnprocessableEntityResponse} from '../../../common/responses.common';
import {HttpErrors} from '../../../common/errors';
import {mimeTypesArray} from '../../../common/constants.common';

export class MediaUploadResponse {
  @ApiModelProperty({
    example: 'selfie.png'
  })
  name: string;

  @ApiModelProperty({
    example: 'worky_1577376229163_rBmF_selfie.png'
  })
  url: string;

  @ApiModelProperty({
    example: 'image/png'
  })
  type: string;
}

export class MediaUploadSuccessResponse {
  @ApiModelProperty({
    type: MediaUploadResponse,
    isArray: true,
  })
  media: MediaUploadResponse[]
}

class BadRequestMessageConstraint {
  @ApiModelProperty({
    example: 'files should not be empty'
  })
  arrayNotEmpty: string;

  @ApiModelProperty({
    example: 'files must be an array'
  })
  isArray: string;
}

class BadRequestMessage {
  @ApiModelProperty({
    example: {}
  })
  target: object;

  @ApiModelProperty({
    example: 'files'
  })
  property: string;

  @ApiModelProperty({
    example: []
  })
  children: object[];

  @ApiModelProperty({
    type: BadRequestMessageConstraint
  })
  constraints: BadRequestMessageConstraint;
}

export class MediaBadRequestResponse extends BadRequest {
  @ApiModelProperty({
    type: BadRequestMessage,
    isArray: true
  })
  message: BadRequestMessage[];
}

export class MediaUnprocessableEntityResponse extends UnprocessableEntityResponse {
  @ApiModelProperty({
    example: 'selfie.png has size 32 MB which is greater than allowed upload size i.e. 30 MB!'
  })
  message: string;
}

export class MediaUnsupportedMediaResponse {
  @ApiModelProperty({
    example: HttpStatus.UNSUPPORTED_MEDIA_TYPE
  })
  statusCode: number;

  @ApiModelProperty({
    example: HttpErrors.UNSUPPORTED_MEDIA_TYPE
  })
  error: string;

  @ApiModelProperty({
    example: `Allowed Media Types: ${mimeTypesArray}!`
  })
  message: string;
}