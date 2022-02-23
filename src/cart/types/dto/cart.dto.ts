import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {IsMongoId, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {AddressDto} from '../../../users/types/dto/user.dto';

class QuantityDTO {
  @ApiModelProperty({example: 2, description: 'quantity '})
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}

export class ProductSubDto extends QuantityDTO {
  // TODO add drug code regex
  @ApiModelProperty({description: 'Ids of prescriptions', example: 'F72-3994-04325-04'})
  @IsString()
  productId: string;
}

export class PrescriptionSubDto {
  @ApiModelProperty({description: 'Ids of prescriptions', example: '8765434567890'})
  @IsMongoId()
  prescriptionId: string;
}

export class CreateCartDTO {
  @ApiModelPropertyOptional({description: 'Ids of prescriptions', type: [PrescriptionSubDto]})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => PrescriptionSubDto)
  prescriptions: PrescriptionSubDto[];

  @ApiModelPropertyOptional({description: 'Internal Ids products', type: [ProductSubDto]})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => ProductSubDto)
  products: ProductSubDto[];


  @ApiModelPropertyOptional({description: 'shipment address', type: AddressDto})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => AddressDto)
  shipmentAddress: AddressDto;

  @ApiModelPropertyOptional({description: 'attach any meta data', example: 'FOr family'})
  @IsOptional()
  @IsString()
  metaData?: string

}

export class UpdateCartDTO extends CreateCartDTO {
  @ApiModelProperty({description: 'cart Id', example: 'lkjhgfdfghjk'})
  @IsMongoId()
  cartId: string;
}

export class CartIdtDTO {
  @ApiModelProperty({description: 'cart Id', example: '5f5742fca031a31c7a57b1de'})
  @IsMongoId()
  cartId: string;
}

export class DeleteFromCartDTO extends CartIdtDTO {
  @ApiModelPropertyOptional({
    example: ['5f5742fca031a31c7a57b1de'],
    isArray: true,
    description: 'product id to remove from cart',
  })
  @IsOptional()
  @IsMongoId({each: true})
  products: string[];

  @ApiModelPropertyOptional({
    example: ['5f5742fca031a31c7a57b1de'],
    isArray: true,
    description: 'prescriptions id to remove from cart',
  })
  @IsOptional()
  @IsMongoId({each: true})
  prescriptions: string[];
}