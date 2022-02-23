import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {IsBoolean, IsDateString, IsIn, IsMongoId, IsOptional} from 'class-validator';

export enum ScheduleIntervalEnum {
  WEEKLY = 'weekly',
  DAILY = 'daily',
  MONTHLY = 'monthly',
  FORTNIGHTLY = 'fortnightly',
}

export class ScheduleOrderDto {
  @ApiModelProperty({description: 'create cart before schedule orders'})
  @IsMongoId()
  cartId: string;

  @ApiModelProperty({description: 'datetime of next order', example: new Date()})
  @IsDateString()
  nextDate: string;

  @ApiModelProperty({
    description: 'weekly or monthly intervals',
    example: ScheduleIntervalEnum.DAILY,
  })
  @IsIn(Object.values(ScheduleIntervalEnum))
  scheduleInterval: ScheduleIntervalEnum;
}

export class PatchNextScheduleOrderDto {
  @ApiModelPropertyOptional({example: true})
  @IsOptional()
  @IsBoolean()
  isValid: boolean;

  @ApiModelPropertyOptional({description: 'datetime of next order', example: new Date()})
  @IsOptional()
  @IsDateString()
  nextDate?: string;
}

export class ScheduleOrderIdDto {
  @ApiModelProperty({description: 'monggo id of schedule order'})
  @IsMongoId()
  orderId: string;
}
