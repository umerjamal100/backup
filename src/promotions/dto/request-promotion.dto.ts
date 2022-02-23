import {ApiModelProperty} from "@nestjs/swagger";
import {IsDateString, IsDefined, IsIn, IsMongoId, IsOptional} from "class-validator";
import {AdvertisementEnum} from "../types/enums/advertisement.enum";
import {PaginationDTO} from "../../admin/types/admin.dto";

export class RequestAdvertisementFieldsDto {

  @ApiModelProperty({description: 'set start time of advertisement', example: new Date()})
  @IsDateString()
  startDate: string;

  @ApiModelProperty({description: 'set end time of advertisement', example: new Date()})
  @IsDateString()
  endDate: string;

  @ApiModelProperty({
    description: 'Status',
    example: AdvertisementEnum.REQUESTED
  })
  @IsIn(Object.keys(AdvertisementEnum))
  status: string;
}

export class RequestAdvertisementDto extends RequestAdvertisementFieldsDto {
  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsDefined()
  @IsMongoId()
  advertisement: string;
}

export class PatchRequestAdvertisementDto {
  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsDefined()
  @IsMongoId()
  requestAdvertisementId: string;

  @ApiModelProperty({description: 'set start time of advertisement', example: new Date()})
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiModelProperty({description: 'set end time of advertisement', example: new Date()})
  @IsOptional()
  @IsDateString()
  endDate: string;

  @ApiModelProperty({
    description: 'Status',
    example: AdvertisementEnum.REQUESTED
  })
  @IsIn(Object.keys(AdvertisementEnum))
  @IsOptional()
  status: string;
}

export class RequestPromotionStatusDto extends PaginationDTO {
  @ApiModelProperty({
    description: 'Status',
    example: AdvertisementEnum.REQUESTED
  })
  @IsIn(Object.keys(AdvertisementEnum))
  @IsOptional()
  status: string;
}
