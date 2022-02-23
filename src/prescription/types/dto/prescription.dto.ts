import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import {Type} from "class-transformer";
import {UrlSchemaModelInterface} from "../../../schemas/prescription.schema";
import {Buckets} from "../../../helpers/interfaces/aws.helper.interface";

export class UrlSchemaDTO implements UrlSchemaModelInterface {

  // @ts-ignore
  @ApiModelPropertyOptional({example: 'IDCARD'})
  @IsIn(Object.keys(Buckets).map(k => k))
  bucketName: Buckets;

  @ApiModelPropertyOptional({example: 'upc.jpg'})
  @IsString()
  url: string;
}

export class CreatePrescriptionDto {
  @ApiModelProperty({
    description: 'url of s3 bucket with bucket name',
    example: [{url: "blue.jpg", bucketName: "myBucket"}]
  })
  @IsArray()
  @ValidateNested({each: true})
  @ArrayNotEmpty()
  @Type(() => UrlSchemaDTO)
  urlBucket: UrlSchemaDTO[];

  @ApiModelPropertyOptional({example: '9876545678542'})
  @IsOptional()
  @IsMongoId()
  relation?: string;

  @ApiModelProperty({example: true})
  @IsBoolean()
  healthCardApplied: boolean;
}

export class PrescriptionIdDTO {
  @ApiModelPropertyOptional({example: '9876545678'})
  @IsOptional()
  @IsMongoId()
  prescriptionId?: string;
}