import {ApiModelProperty, ApiModelPropertyOptional} from "@nestjs/swagger";
import {IsBooleanString, IsIn, IsNumber, IsNumberString, IsOptional, Max, Min} from "class-validator";
import {Type} from "class-transformer";
import {RiderStateEnum} from "../../../rider/types/enums/rider.enum";

export class RiderPaginationDto {

  @ApiModelPropertyOptional({example: 'DELIVERY'})
  @IsIn(Object.keys(RiderStateEnum).map((k) => RiderStateEnum[k]))
  @IsOptional()
  state: string;

  @ApiModelPropertyOptional({example: true})
  @IsBooleanString()
  @IsOptional()
  online: string

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