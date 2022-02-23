import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import {Type} from 'class-transformer';
import {PharmacyIdDTO} from '../../../pharmacy/types/dto/pharmacy.dto';
import {ProductType, Symptoms} from "../../../schemas/interfaces/products.interface";

export class GetItemsDTO extends PharmacyIdDTO {
  @ApiModelPropertyOptional({example: 'vitamin c'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiModelPropertyOptional({example: '987654567890'})
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiModelPropertyOptional({example: 'PRODUCT'})
  @IsOptional()
  @IsIn(Object.keys(ProductType).map(k => ProductType[k]))
  productType?: ProductType;

  @ApiModelPropertyOptional({example: 'Flu'})
  @IsOptional()
  @IsIn(Object.keys(Symptoms).map(k => Symptoms[k]))
  symptoms?: Symptoms;

  @ApiModelPropertyOptional({example: 'dummy'})
  @IsOptional()
  @IsString()
  salts?: string;

  @ApiModelPropertyOptional({example: 'dummy'})
  @IsOptional()
  @IsString()
  @IsIn(['SYMPTOMS', 'SALTS', 'PACKAGENAME', 'PROD_CATEGORY'])
  category?: string;

  @ApiModelPropertyOptional({example: 10})
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiModelPropertyOptional({example: true})
  @IsOptional()
  @IsBooleanString()
  isDiscount?: boolean;
}


export class ProductIdDTO {
  @ApiModelProperty({example: '98765434567890'})
  @IsMongoId()
  productId: string;
}

export class ProductFilterDTO {
  @ApiModelProperty({example: '98765434567890'})
  @IsBoolean()
  @IsOptional()
  isDiscount: boolean;
}

export class ProductDTO {
  @ApiModelProperty({example: 45})
  @IsNumber()
  @IsOptional()
  packagePrice: number;

  @ApiModelProperty({example: 0.45})
  @IsNumber()
  @IsOptional()
  unitPrice: number;

  @ApiModelProperty({example: '100s'})
  @IsString()
  @IsOptional()
  packageSize: string;

  @ApiModelProperty({example: true})
  @IsBoolean()
  @IsOptional()
  discount: boolean

  @ApiModelProperty({example: 20})
  @IsOptional()
  @IsNumber()
  discountPercentage: number
}

export class SearchAndSortDTO extends GetItemsDTO {
  @ApiModelPropertyOptional({example: 'asc'})
  @IsOptional()
  @IsIn(['asc', 'desc'])
  name?: string

  @ApiModelPropertyOptional({example: 'asc'})
  @IsOptional()
  @IsIn(['asc', 'desc'])
  price?: string

  @ApiModelPropertyOptional({example: 5})
  @IsOptional()
  lastPrice?: number

  @ApiModelPropertyOptional({example: 1})
  @IsOptional()
  min?: number

  @ApiModelPropertyOptional({example: 50})
  @IsOptional()
  max?: number

  @ApiModelPropertyOptional({example: 'asc'})
  @IsOptional()
  @IsString()
  lastName?: string

}

export class SearchDTO extends GetItemsDTO {
}

export class ProductSuggestionDTO {
  @ApiModelProperty()
  @IsString()
  symptoms: string
}

// export class SearchAndSortDTO extends SearchDTO {};