import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {FamilyModelInterface, FamilyModelStructure} from '../../../schemas/family.schema';
import {cardCode, ISOCountryCodes, PaymentTypeEnum} from "../enums/user.enum";
import {AddressModelInterface} from "../../../schemas/address.schema";
import {Type} from "class-transformer";
import {UrlSchemaDTO} from "../../../prescription/types/dto/prescription.dto";
import {OrderDTO} from "../../../pharmacy/types/dto/pharmacy.dto";
import {PatientChatLevel} from "../../../admin-chat/types/enum";
import {CardInterface, OriginalTransactionInterface} from "../../../schemas/interfaces/user.interface";

export class AddressDto implements AddressModelInterface {
  @ApiModelProperty({example: 'kfc', description: 'address Name'})
  @IsString()
  @IsNotEmpty()
  addressName: string;


  @ApiModelProperty({example: 'Arab Emirates'})
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiModelProperty({example: 'street 29/3'})
  @IsString()
  @IsNotEmpty()
  streetAddress: string;


  @ApiModelPropertyOptional({example: '31.473186, 74.2650702'})
  @IsOptional()
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  coordinates: string | any[];

  @ApiModelPropertyOptional({example: '3rd floor'})
  @IsString()
  @IsOptional()
  additionalInformation: string
}

// TODO use partial type for patch profile dto

export class FamilyDTO implements FamilyModelInterface {
  @ApiModelPropertyOptional({example: '784-1234-1234567-1'})
  @ValidateIf(o => o.emiratesIdPic)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Matches(/^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/)
  emiratesId: string;

  @ApiModelProperty({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @ValidateIf(o => o.emiratesId)
  @IsDefined()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  emiratesIdPic: UrlSchemaDTO;

  @ApiModelProperty({example: 'imxm', description: 'firstName'})
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiModelProperty({example: 'imxm', description: 'firstName'})
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  profilePic: UrlSchemaDTO;

  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  healthCardPic: UrlSchemaDTO;

  @ApiModelProperty({example: 'BROTHER', description: 'userId'})
  @IsIn(['BROTHER', 'SISTER', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER'].map(k => k))
  relationship: string;

}

export class PatchFamilyDTO implements FamilyModelInterface {
  @ApiModelPropertyOptional({example: '784-1234-1234567-1', description: 'firstName'})
  @ValidateIf(o => o.emiratesIdPic)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Matches(/^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/)
  emiratesId: string;

  @ApiModelProperty({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @ValidateIf(o => o.emiratesId)
  @IsDefined()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  emiratesIdPic: UrlSchemaDTO;

  @ApiModelPropertyOptional({example: 'imxm', description: 'firstName'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiModelPropertyOptional({example: 'imxm', description: 'firstName'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  profilePic: UrlSchemaDTO;

  @ApiModelPropertyOptional({example: 'cb', description: 'userId'})
  @IsOptional()
  @IsIn(['BROTHER', 'SISTER', 'FATHER', 'MOTHER', 'SON', 'DAUGHTER'].map(k => k))
  relationship: string;

  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  healthCardPic: UrlSchemaDTO;

  @ApiModelProperty({example: 'asdfghjk', description: 'sub documents od'})
  @IsMongoId()
  _id: any;
}

export class PatchProfileDTO {

  @ApiModelPropertyOptional({example: 'moazzamarif24@gmail.com', description: 'email'})
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiModelPropertyOptional({example: '+32-331-977-9577', description: 'phone number'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiModelPropertyOptional({example: 'imxm', description: 'firstName'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiModelPropertyOptional({example: 'cb', description: 'userId'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string;


  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  profilePic: UrlSchemaDTO;

  @ApiModelPropertyOptional({example: '784-1234-1234567-1'})
  @ValidateIf(o => o.emiratesIdPic)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Matches(/^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/)
  emiratesId: string;

  @ApiModelProperty({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @ValidateIf(o => o.emiratesId)
  @IsDefined()
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  emiratesIdPic: UrlSchemaDTO;

  @ApiModelPropertyOptional({example: {url: "blue.jpg", bucketName: "myBucket"}})
  @ValidateNested({each: true})
  @Type(() => UrlSchemaDTO)
  healthCardPic: UrlSchemaDTO;

}

export class RelationsDTO {
  @ApiModelProperty({type: PatchFamilyDTO})
  relations: FamilyModelStructure;
}

export class EmiratesDTO {
  @ApiModelProperty({example: '784-1234-1234567-1', description: 'firstName'})
  @IsString()
  @IsNotEmpty()
  @Matches(/^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/)
  emiratesId: string;
}

export class MongoIdDTO {
  @ApiModelProperty({example: '784-1234-1234567-1', description: 'id of sub docs or doc'})
  @IsMongoId()
  id: string;
}

export class AddressIdDTO {
  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsDefined()
  id: string;
}

export class UserPaymentAcceptanceDTO {
  @ApiModelProperty({example: true})
  @IsBoolean()
  isAccepted: boolean

  @ApiModelProperty({example: PaymentTypeEnum.CASH_ON_DELIVERY})
  @ValidateIf(o => o.isAccepted === true)
  @IsDefined()
  @IsIn(Object.keys(PaymentTypeEnum).map(k => PaymentTypeEnum[k]))
  type: PaymentTypeEnum;

  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsString()
  orderId: string;
}

export class RatingDTO {

  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsMongoId()
  orderId: string;

  @ApiModelProperty({example: '5fd35e49aa098e32eccb7b4c'})
  @IsMongoId()
  bucketId: string;

  @ApiModelProperty({example: 4})
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  riderRating: number;

  @ApiModelProperty({example: 'keep me informed at each stage and delivered securely and on time.'})
  @IsString()
  @IsOptional()
  riderFeedback: string;

  @ApiModelProperty({example: 4})
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  bucketRating: number;

  @ApiModelProperty({example: 'Nicely packed.'})
  @IsString()
  @IsOptional()
  bucketFeedback: string;

  @ApiModelProperty({example: 4})
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  orderRating: number;

  @ApiModelProperty({example: 'Overall great Experience.'})
  @IsString()
  @IsOptional()
  orderFeedback: string;
}

export class FavoritesParams {
  @ApiModelProperty({example: '2196865321z44s46113148'})
  @IsString()
  drugCode: string;
}

export class AdminOrderChatDTO extends OrderDTO {
  @ApiModelPropertyOptional({example: '2196865321z44s46113148'})
  @ValidateIf(o => o.chatLevel === PatientChatLevel.BUCKET)
  @IsDefined()
  @IsMongoId()
  bucketId?: string;

  @ApiModelProperty({example: PatientChatLevel.ORDER})
  @IsIn(Object.keys(PatientChatLevel).map(k => PatientChatLevel[k]))
  chatLevel: PatientChatLevel;
}

export class UserClickedDto {
  @ApiModelPropertyOptional({example: true})
  @IsBoolean()
  userClicked: boolean;
}

export class AdminMessage {
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
  adminChatId: string;
}

export class AdminChatDTO {
  @ApiModelProperty({example: '5fc766ff882b6365c46fa4ed'})
  @IsMongoId()
  adminChatId: string;

}


export class AdminChatPaginationDTO extends AdminChatDTO {
  @ApiModelPropertyOptional({example: "5fc766ff882b6365c46fa4ed"})
  @IsOptional()
  @IsMongoId()
  cursor?: string;

  @ApiModelProperty({example: 15})
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit: number;
}

class CardDTO implements CardInterface {
  @ApiModelProperty({example: '1111'})
  @IsString()
  Last4: string;

  @ApiModelProperty({example: Object.keys(cardCode)[0]})
  @IsIn(Object.keys(cardCode))
  cardCode: cardCode;

  @ApiModelProperty({example: Object.keys(ISOCountryCodes)[0]})
  @IsIn(Object.keys(ISOCountryCodes))
  country: ISOCountryCodes;

  @ApiModelProperty({example: '01'})
  @IsString()
  expiryMonth: string;

  @ApiModelProperty({example: '2021'})
  @IsString()
  expiryYear: string;

  @ApiModelProperty({example: '202155'})
  @IsString()
  first6: string;
}

export class SaveCardTransactionDTO implements OriginalTransactionInterface {
  @ApiModelProperty({example: '21588563225561215761310'})
  @IsString()
  completeCode: string;

  @ApiModelProperty({example: '25561215761310'})
  @IsString()
  tranRef: string;

  @ApiModelProperty({})
  @ValidateNested({each: true})
  @IsDefined()
  @Type(() => CardDTO)
  card: CardDTO;
}

