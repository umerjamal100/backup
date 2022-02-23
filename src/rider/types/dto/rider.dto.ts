import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {IsBoolean, IsDefined, IsOptional, IsString, Matches, ValidateIf} from 'class-validator';

export class CreateRiderDTO {
  @ApiModelProperty({example: 'Jhonny Boi'})
  @IsString()
  name: string;

  @ApiModelProperty({example: 'RIDER'})
  @IsString()
  role: string;

  @ApiModelPropertyOptional({example: '31.473186, 74.2650702'})
  @IsOptional()
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  currentLocation: any;
}

export class PatchRiderDTO {
  @ApiModelPropertyOptional({example: '31.473186, 74.2650702'})
  @IsOptional()
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  currentLocation: any;

  @ApiModelPropertyOptional({example: true})
  @IsOptional()
  @IsBoolean()
  isOnline: boolean
}

export class RiderOrderAcceptanceDTO {
  @ApiModelPropertyOptional({example: true})
  @IsBoolean()
  isAccepted: boolean;

  @ApiModelPropertyOptional({example: '31.473186, 74.2650702'})
  @ValidateIf(o => o.isAccepted === true)
  @IsDefined()
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  currentLocation: any;
  @ApiModelPropertyOptional({example: ['No Space']})
  @ValidateIf(o => o.isAccepted === false)
  @IsDefined()
  reason: any[]

  @ApiModelProperty()
  @IsString()
  riderBucketId: string

  @ApiModelProperty()
  @IsString()
  bucketId: string
}

export class CurrentLocationDTO {
  @ApiModelPropertyOptional({example: '31.473186, 74.2650702'})
  @IsString()
  @Matches(/-?[1-9][0-9]*(\.[0-9]+)?,\s*-?[1-9][0-9]*(\.[0-9]+)?/)
  currentLocation: string;
}