import {ApiModelProperty, ApiModelPropertyOptional} from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min
} from "class-validator";
import {UserRole} from "../../common/enum.common";
import {AdminChatDTO} from "../../users/types/dto/user.dto";
import {AdminChatStatus} from "../../admin-chat/types/enum";
import {Type} from "class-transformer";

export class PatchAdminDTO {
  @ApiModelProperty({example: '+92-311-565-5807'})
  @IsPhoneNumber(null)
  phone: string;

  @ApiModelProperty({example: 'Admin@gmail.com'})
  @IsEmail()
  email: string;

  @ApiModelProperty({example: '9876545678'})
  @IsString()
  @IsNotEmpty()
  emiratesId: string;
}

export class PaginationDTO {
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

export class PatchAdminChatDTO extends AdminChatDTO {
  @ApiModelProperty({example: AdminChatStatus.MARKED})
  @IsOptional()
  @IsIn(Object.keys(AdminChatStatus).map(k => AdminChatStatus[k]))
  status: AdminChatStatus
}

export class AdminOrderChatHeadsDTO extends PaginationDTO {
  @ApiModelProperty({example: AdminChatStatus.MARKED})
  @IsIn(Object.keys(AdminChatStatus).map(k => AdminChatStatus[k]))
  status: AdminChatStatus

  @ApiModelProperty({example: UserRole.Patient})
  @IsIn(Object.keys(UserRole).map(k => UserRole[k]))
  role: UserRole
}

export class AdminInformationChatHeadsDTO extends PaginationDTO {
  @ApiModelProperty({example: AdminChatStatus.MARKED})
  @IsIn(Object.keys(AdminChatStatus).map(k => AdminChatStatus[k]))
  status: AdminChatStatus

  @ApiModelProperty({example: UserRole.Pharmacy})
  @IsIn(Object.keys(UserRole).map(k => UserRole[k]))
  role: UserRole
}

