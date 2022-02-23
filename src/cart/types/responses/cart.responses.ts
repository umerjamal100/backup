import {CartModelInterface} from '../../../schemas/cart.schema';
import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {PrescriptionSubDto, ProductSubDto} from '../dto/cart.dto';
import {AddressDto} from '../../../users/types/dto/user.dto';
import {AddressModelInterface} from '../../../schemas/address.schema';

export class CreateCartResponse implements CartModelInterface {
  @ApiModelProperty({type: [PrescriptionSubDto]})
  prescriptions: Array<{prescriptionId: string; quantity: number}>;

  @ApiModelProperty({type: [ProductSubDto]})
  products: Array<{productId: string; quantity: number}>;

  @ApiModelProperty({example: 'IN_PROGRESS'})
  status: string;

  @ApiModelProperty({example: '760'})
  total: number;

  @ApiModelProperty({example: '987654345tyuil'})
  user: string;

  @ApiModelPropertyOptional({type: AddressDto})
  shipmentAddress: AddressModelInterface

  @ApiModelProperty({example: 'for family'})
  metaData: string;

}