import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {AddressDto} from '../../../users/types/dto/user.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {Type} from 'class-transformer';
import {BucketStatusEnum} from '../../../order/types/enums/order.enum';
// @ts-ignore
import {messaging} from "firebase-admin/lib/messaging";
import {PharmacyAcceptIssues, PharmacyRejectReasons} from "../enums/pharmacy.enum";
import {UrlSchemaDTO} from "../../../prescription/types/dto/prescription.dto";
import {CommentInterface, IssuesInterface, VideoInterface} from "../../../schemas/bucket.schema";
import {ProductType, ProductTypeExtended} from "../../../schemas/interfaces/products.interface";
import AndroidConfig = messaging.AndroidConfig;

// import AndroidConfig = admin.messaging.AndroidConfig;

export class CreatePharmacyDTO {
  @ApiModelProperty({type: AddressDto})
  @ValidateNested({
    each: true,
  })
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiModelProperty({example: '987654'})
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiModelProperty({example: 'kjhgfghjk'})
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiModelProperty({example: 'kjhgfghjkl'})
  @IsString()
  @IsNotEmpty()
  logo: string;

  @ApiModelProperty({example: 'kjhgfghjk'})
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class PharmacyIdDTO {
  @ApiModelPropertyOptional({example: '9876545678'})
  @IsOptional()
  @IsMongoId()
  pharmacyId?: string;
}

export class ProductTypeDTO {
  @ApiModelPropertyOptional({example: 'PRODUCT'})
  @IsOptional()
  @IsIn(Object.keys(ProductType).map(k => ProductType[k]))
  productType?: ProductType;
}

export class ProductTypeExtendedDTO {
  @ApiModelPropertyOptional({example: 'PRODUCT'})
  @IsOptional()
  @IsIn(Object.keys(ProductTypeExtended).map(k => ProductTypeExtended[k]))
  productType?: ProductTypeExtended;
}


export class PharmacyDTOs {
  @ApiModelPropertyOptional({example: '9876545678'})
  @IsOptional()
  @IsMongoId()
  userId?: string;
}

export class PharmacyOnlineDTO {
  @ApiModelPropertyOptional({example: true})
  @IsBoolean()
  isOnline: boolean;
}

export class BucketByStatus {
  @ApiModelPropertyOptional({example: BucketStatusEnum.WAITING_FOR_PHARMACY_CONFIRMATION})
  @IsOptional()
  @IsIn(Object.keys(BucketStatusEnum).map((k) => BucketStatusEnum[k]))
  status: BucketStatusEnum;
}

export class BucketPatchDTO extends BucketByStatus {
  @ApiModelProperty({example: '090078601'})
  @IsString()
  bucketId: string;
  @ApiModelProperty({example: '090078601'})
  @IsString()
  orderId: string;
}

export class NearByDTO {
  @ApiModelProperty({example: '-81.00, 90.10'})
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  coordinates: string;

  @ApiModelProperty({example: 5})
  @IsString()
  @IsNotEmpty()
  radius: string;
}

export class BucketIdDTO {
  @ApiModelProperty({example: '090078601'})
  @IsString()
  bucketId: string;
}

export class PriceList {
  @ApiModelProperty({example: '25555555888888888'})
  @IsDefined()
  @IsMongoId()
  prescriptionId: string;

  @ApiModelPropertyOptional({example: 200})
  @IsDefined()
  @IsPositive()
  subTotal: number;

  @ApiModelPropertyOptional({example: 200})
  @IsDefined()
  @IsPositive()
  discount: number;

  @ApiModelPropertyOptional({example: 200})
  @IsDefined()
  @IsPositive()
  total: number;
}

class VideoDTO extends UrlSchemaDTO implements VideoInterface {
  @ApiModelPropertyOptional({example: '9876545678'})
  @IsDefined()
  @IsMongoId()
  prescriptionId: string;
}

class IssuesDTO implements IssuesInterface {
  @IsDefined()
  @IsArray()
  @IsIn(Object.keys(PharmacyAcceptIssues).map(k => k), {each: true})
  issue: PharmacyAcceptIssues[];

  @IsDefined()
  @IsMongoId()
  prescriptionId: string;
}

class CommentDTO implements CommentInterface {
  @IsDefined()
  @IsString()
  comment: string;

  @IsDefined()
  @IsMongoId()
  prescriptionId: string;
}

export class PharmacyOrderAcceptanceDTO {
  @ApiModelProperty({example: true})
  @IsBoolean()
  isAccepted: boolean;

  @ApiModelProperty({example: '5fd35e49aa098e32eccbbb4c'})
  @IsString()
  bucketId: string;

  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsString()
  orderId: string;

  @ApiModelProperty({example: [{prescriptionId: "60536a739703f00f6c47af44", subTotal: 200, discount: 100, total: 100}]})
  @ValidateNested({each: true})
  @ValidateIf(o => o.isAccepted === true)
  @Type(() => PriceList)
  @IsOptional()
  @IsArray()
  priceList: PriceList[];

  @ApiModelProperty({example: [{prescriptionId: '60536a739703f00f6c47af44', issue: ['HEALTH_CARD_NOT_VALID']}]})
  @ValidateIf(o => o.isAccepted === true)
  @ValidateNested({each: true})
  @IsOptional()
  @IsArray()
  @Type(() => IssuesDTO)
  issues: IssuesDTO[];

  @ApiModelProperty({example: ['MEDICINES_NOT_AVAILABLE']})
  @ValidateIf(o => o.isAccepted === false)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(Object.keys(PharmacyRejectReasons).map(k => k), {each: true})
  reasons: PharmacyRejectReasons[];

  @ApiModelProperty({
    description: 'url of s3 bucket with bucket name',
    example: [{prescriptionId: "60536a739703f00f6c47af44", url: "blue.mp4", bucketName: "HEALTH_CARD"}]
  })
  @ValidateIf(o => o.isAccepted === true)
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @ArrayNotEmpty()
  @Type(() => VideoDTO)
  videos: VideoDTO[];

  @ApiModelProperty({example: [{prescriptionId: "60536a739703f00f6c47af44", comment: "any written words"}]})
  @ValidateIf(o => o.isAccepted === true)
  @IsOptional()
  @ValidateNested({each: true})
  @IsArray()
  @Type(() => CommentDTO)
  comments: CommentDTO[]
}

export class BucketDTO {
  @ApiModelProperty({example: '5fd35e49aa098e32eccbbb4c'})
  @IsString()
  bucketId: string;
}

export class OrderDTO {
  @ApiModelProperty({example: '5fd35e49aa098e32eccbbb4c'})
  @IsString()
  orderId: string;
}


export class RiderBucketDTO {
  @ApiModelProperty({example: '5fd35e49aa098e32eccbbb4c'})
  @IsString()
  riderBucketId: string;
}

export class ChatBucketDTO {
  @ApiModelProperty({example: '5fd35e49aa098e32eccbbb4c'})
  @IsString()
  ChatBucketId: string;
}

export class StatsQueryDTO {
  @IsNotEmpty()
  @IsDateString()
  @ApiModelProperty({example: '2021-03-08T19:00:01Z'})
  @IsString()
  start: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiModelProperty({example: '2021-03-09T19:00:00Z'})
  @IsString()
  end: string;
}

export class BucketVideoDTO extends BucketDTO {
  @ApiModelProperty({
    description: 'url of s3 bucket with bucket name',
    example: [{prescriptionId: "60536a739703f00f6c47af44", url: "blue.mp4", bucketName: "HEALTH_CARD"}]
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({each: true})
  @ArrayNotEmpty()
  @Type(() => VideoDTO)
  videos: VideoDTO[];
}

export class AdminPharmacyOrderChatDTO extends OrderDTO {
  @ApiModelPropertyOptional({example: '2196865321z44s46113148'})
  @IsDefined()
  @IsMongoId()
  bucketId: string;
}
