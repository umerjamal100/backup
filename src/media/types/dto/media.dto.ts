import {
  Allow,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import {Type} from 'class-transformer';
import {mimeTypesArray} from '../../../common/constants.common';
import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';

class FileDto {
  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @IsString()
  @IsNotEmpty()
  originalname: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(mimeTypesArray)
  mimetype: string;

  @IsNumber()
  size: number;

  @Allow()
  buffer: Buffer;
}

export class FilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({
    each: true
  }) @Type(() => FileDto)
  files: FileDto[];

  constructor(data: FileDto[]) {
    if (data && data.length) {
      this.files = data
    }
  }
}

export class CSVFileDTO {
  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @IsString()
  @IsNotEmpty()
  originalname: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['text/csv'])
  mimetype: string;

  @IsNumber()
  size: number;

  @Allow()
  buffer: Buffer;
}

export class CSVFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({
    each: true
  })
  @Type(() => CSVFileDTO)
  files: CSVFileDTO[];

  // constructor(data: CSVFileDTO[]) {
  //   if (data && data.length) {
  //     this.files = data
  //   }
  // }
}

export class Bucket {
  @ApiModelPropertyOptional({example: 'IDCARD'})
  @IsIn(['IDCARD', 'PRESCRIPTION', 'PROFILE', 'HEALTH_CARD', 'AD'])
  bucketName: string;
}

export class PharmacyIdQuery {
  @ApiModelProperty({example: '987654345yu'})
  @IsMongoId()
  pharmacyId: string;
}