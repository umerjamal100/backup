import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {IsIn, IsMongoId} from 'class-validator';
import {BucketStatusEnum} from "../enums/order.enum";


export class RiderBucketPatchDTO {

  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  riderBucketId: string;
  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  bucketId: string

  @ApiModelPropertyOptional({example: BucketStatusEnum.RIDER_ARRIVED_TO_PHARMACY})
  @IsIn(Object.keys(BucketStatusEnum).map((k) => BucketStatusEnum[k]))
  status: BucketStatusEnum

}