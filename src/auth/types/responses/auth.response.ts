import {ApiModelProperty} from '@nestjs/swagger';
import {HttpStatus} from '@nestjs/common';

export class ResetPasswordSuccessResponse {
  @ApiModelProperty({example: HttpStatus.CREATED})
  statusCode: number;

  @ApiModelProperty({example: 'Password Updated Successfully!'})
  message: string;
}