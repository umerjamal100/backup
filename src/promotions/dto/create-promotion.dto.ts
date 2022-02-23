import {ApiModelProperty} from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {UrlSchemaDTO} from "../../prescription/types/dto/prescription.dto";
import {AdminChatStatus} from "../../admin-chat/types/enum";
import {UserRole} from "../../common/enum.common";
import {PaginationDTO} from "../../admin/types/admin.dto";

export class CreateAdvertisementDto {

  @ApiModelProperty({
    description: 'url of s3 bucket with bucket name',
    example: [{url: "blue.jpg", bucketName: "myBucket"}]
  })
  @IsArray()
  @ValidateNested({each: true})
  @ArrayNotEmpty()
  @Type(() => UrlSchemaDTO)
  urlBucket: UrlSchemaDTO[];

  @ApiModelProperty({
    description: 'description',
    example: 'sss'
  })
  @IsString()
  description: string

  @ApiModelProperty()
  @IsArray()
  tags: string[]

  @ApiModelProperty({
    description: 'Name',
    example: 'Free Panadol'
  })
  @IsString()
  name: string

}

export class UpdateAdvertisementDTO extends CreateAdvertisementDto {
  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsDefined()
  @IsMongoId()
  id: string;
}