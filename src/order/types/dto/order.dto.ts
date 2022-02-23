import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import {UserRemoveBucketEnum} from "../enums/order.enum";
import {Type} from "class-transformer";
import {UrlSchemaDTO} from "../../../prescription/types/dto/prescription.dto";

export class SubmitOrderDTO {
  @ApiModelProperty({example: ['5f61de2f210f1e353a11cb7b'], isArray: true, description: 'sub order ids'})
  @IsMongoId({each: true})
  subOrdersIds: string[];

  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b', isArray: true, description: 'order id'})
  @IsMongoId()
  orderId: string;
}

export class OrderIdDTO {
  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsString()
  orderId: string;
}

export class OrderAcceptanceDTO {
  @ApiModelProperty({example: true})
  @IsBoolean()
  isAccepted: boolean;

  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  orderId: string;

  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  bucketId: string;

  @ApiModelPropertyOptional({example: "Medicine not present"})
  @ValidateIf((orderAcceptance: OrderAcceptanceDTO) => !orderAcceptance.isAccepted)
  @IsNotEmpty()
  @IsString()
  reason?: string; // TODO add standard templated reasons

}

export class RiderAccept extends OrderAcceptanceDTO {
  @ApiModelProperty({example: '5fc766ff882b6365c46fa4ed'})
  @IsString()
  riderId: string;
}

export class RemoveBucketsDTO {
  @ApiModelProperty({example: '605ce67f1917a985e8efb355'})
  @IsDefined()
  @IsMongoId({each: true})
  bucketId: string

  @ApiModelProperty({example: ['BUCKET_IS_COSTLY']})
  @ArrayNotEmpty()
  @IsIn(Object.keys(UserRemoveBucketEnum).map(k => k), {each: true})
  reasons: UserRemoveBucketEnum[]
}

export class MessageDTO {
  @ApiModelProperty({example: 'Hello'})
  @IsString()
  content: string;

  @ApiModelPropertyOptional({
    description: 'url of s3 bucket with bucket name',
    example: [{url: "blue.jpg", bucketName: "myBucket"}]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @ArrayNotEmpty()
  @Type(() => UrlSchemaDTO)
  urlBucket: UrlSchemaDTO[];

  @ApiModelProperty({example: '5fc766ff882b6365c46fa4ed'})
  @IsMongoId()
  chatBucketId: string;
}