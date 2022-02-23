import {
  IsDateString,
  IsDefined,
  IsIn,
  IsMongoId,
  IsNumber,
  IsNumberString,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {OrderStatusEnum} from '../../../order/types/enums/order.enum';
import {Type} from 'class-transformer';

export class GroupByStatusDto {
  @ApiModelProperty({example: '2021-04-06T19:00:01Z'})
  @IsDateString()
  from: string;

  @ApiModelProperty({example: '2021-04-06T19:00:01Z'})
  @IsDateString()
  to: string;
}

export class OrderIdDTO {
  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  id: string;
}

export class BucketIdDTO {
  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  id: string;
}

export class PaginationDto {
  @ApiModelProperty({example: '2021-04-06T19:00:01Z', required: false})
  @IsDateString()
  @ValidateIf((o) => o.to)
  @IsDefined()
  from: string;

  @ApiModelProperty({example: '2021-04-06T19:00:01Z', required: false})
  @IsDateString()
  @ValidateIf((o) => o.from)
  @IsDefined()
  to: string;

  @ApiModelProperty({example: 'RUNNING', required: false})
  @IsIn(Object.keys(OrderStatusEnum).map((k) => OrderStatusEnum[k]))
  @IsOptional()
  status: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsNumberString()
    // @Min(0)
  cursor?: number;

  @ApiModelProperty({example: 15})
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit: number;
}

