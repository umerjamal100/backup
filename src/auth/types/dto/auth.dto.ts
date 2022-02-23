import {GooglePlatform, GuestLoginBody, IDP, PatientLoginBody, WebLoginBody} from '../interfaces/auth.interface';
import {ApiModelProperty, ApiModelPropertyOptional} from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import {UserRole} from '../../../common/enum.common';
import {AdministrationModelInterface, AdminModelInterface} from "../../../schemas/admin.schema";
import {Type} from "class-transformer";
import {AddressModelInterface} from "../../../schemas/address.schema";
import {AddressDto} from "../../../users/types/dto/user.dto";

export class WebLoginDTO implements WebLoginBody {
  @ApiModelProperty({example: 'imxm@deepdive.com.pk'})
  @IsEmail()
  email: string;

  @ApiModelProperty({example: 'imxm@deepdive.com.pk'})
  @IsString()
  @IsNotEmpty()
  password: string;

}

export class PatientLoginDTO implements PatientLoginBody {
  @ApiModelProperty({example: '9876545678'}) // TODO add emiratesId class Validator
  @IsString()
  @IsNotEmpty()
  emiratesId: string;

  @ApiModelProperty({example: 'imxm@deepdive.com.pk'})
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class GuestLoginDTO implements GuestLoginBody {
  @ApiModelProperty({example: '9876545678'}) // TODO add emiratesId class Validator
  @IsPhoneNumber(null)
  phone: string;

  @ApiModelProperty({example: 'imxm@deepdive.com.pk'})
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class PatientRegisterDTO {

  @ApiModelProperty({example: '+92-311-565-5807'})
  @IsPhoneNumber('')
  phone: string;

  @ApiModelProperty({example: 'randomstring'})
  @IsString()
  //At least 8 characters long;
  // One lowercase, one uppercase, one number and one special character;
  // No whitespaces.
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
  password: string;

  @ApiModelPropertyOptional({example: 'imxm@deepdive.com.pk'})
  @IsOptional()
  @IsEmail()
  email: string;
}

export class VerifyPhoneDTO {
  @ApiModelProperty({example: '+92-311-565-5807'})
  @IsPhoneNumber('')
  phone: string;

  @ApiModelProperty({example: '87654', description: '6 digit code on sms'})
  @IsString()
  @IsNotEmpty()
  code: string;

  constructor(credentials: VerifyPhoneInterface) {
    if (credentials) {
      this.phone = credentials.phone;
      this.code = credentials.code;
    }
  }
}

export class VerifyEmailDTO {
  @ApiModelProperty({example: 'imxm@test.com'})
  @IsEmail()
  email: string;

  @ApiModelProperty({example: '87654', description: '6 digit code on sms'})
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiModelPropertyOptional({example: 'Pharmacy'})
  @IsOptional()
  @IsIn(Object.keys(UserRole).map(k => UserRole[k]))
  userType: UserRole;

  constructor(credentials: VerifyEmailInterface) {
    if (credentials) {
      this.email = credentials.email;
      this.code = credentials.code;
      this.userType = credentials.userType;
    }
  }

}

export class VerifyEmailQuery {
  @ApiModelPropertyOptional({example: 'Pharmacy'})
  @IsOptional()
  @IsIn(Object.keys(UserRole).map(k => UserRole[k]))
  userType: UserRole;
}

export class FacebookAuthQuery {
  @ApiModelProperty({example: 'kjhygtf'})
  @IsString()
  access_token: string;
}

export class LoginDto {
  // decorator for API Documentation!
  @ApiModelProperty({example: 'patient@gmail.com'})
  // validation decorator to check for an email field!
  @IsString()
  readonly username: string;

  // decorator for API Documentation!
  @ApiModelProperty({example: 'Deepdive@123$'})
  // validation decorators for password field!
  @IsNotEmpty()
  @IsString()
  readonly password: string;


  constructor(credentials: CredentialsInterface) {
    if (credentials) {
      this.username = credentials.username;
      this.password = credentials.password;
    }
  }
}

export class LoginParams {
  @ApiModelProperty({example: 'PHARMACY'})
  @IsIn(Object.keys(UserRole).map(k => UserRole[k]))
  userRole: string;
}

export interface CredentialsInterface {
  username: string;
  password: string;
}

export interface VerifyPhoneInterface {
  phone: string;
  code: string;
}

export interface SocialLoginInterface {
  provider: IDP;
  idToken: string;
  platform: GooglePlatform;
  role: UserRole;
}

export interface VerifyEmailInterface {
  email: string;
  code: string;
  userType?: UserRole;
}

export class ResendOTPPhone {
  @ApiModelProperty({example: '+92-311-565-5807'})
  @IsPhoneNumber(null)
  phone: string;
}

export class ResendOTPEmail {
  @ApiModelProperty({example: 'moazzamarif24@gmail.com'})
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {

  // decorator for API Documentation!
  @ApiModelPropertyOptional({example: 'ixm@deep.dive.pk.dev'})
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiModelPropertyOptional({example: '+92-311-565-5807'})
  @IsOptional()
  @IsPhoneNumber('')
  readonly phone: string;

  // decorator for API Documentation!
  @ApiModelProperty({example: '547893'})
  @IsNotEmpty()
  @IsNumberString()
  code: string;

  // decorator for API Documentation!
  @ApiModelProperty({
    minLength: 8,
    maxLength: 64,
    example: 'Alphabeta@#$%^',
  })
  // validation decorators for password field!
  @IsString()
  @Length(8, 64)
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
  readonly password: string;

}

export class SocialLoginDTO {
  @ApiModelProperty({example: '987654rtyukkjhgt678ijhgt9oiuy'})
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiModelProperty({example: 'FACEBOOK'})
  @IsIn(['FACEBOOK', 'GOOGLE', 'APPLE'])
  provider: IDP;

  @ApiModelProperty({example: 'WEB'})
  @IsIn(['WEB', 'IOS', 'ANDROID'])
  platform: GooglePlatform;

  @ApiModelProperty({example: 'PATIENT'})
  @IsIn(['PATIENT', 'RIDER', 'PHARMACY'])
  role: UserRole;

  // TODO dont make it optional
  constructor(body: SocialLoginInterface) {
    this.idToken = body?.idToken;
    this.provider = body?.provider;
    this.platform = body?.platform;
    this.role = body?.role;
  }
}

export class RegisterPharmacyDTO {
  @ApiModelProperty({example: 'randomstring'})
  @IsString()
  //At least 8 characters long;
  // One lowercase, one uppercase, one number and one special character;
  // No whitespaces.
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
  password: string;

  @ApiModelProperty({example: 'imxm@deepdive.com.pk'})
  @IsEmail()
  email: string;

  @ApiModelProperty({example: '5f61de2f210f1e353a11cb7b'})
  @IsMongoId()
  pharmacyId: string;
}

export class RegisterRiderDTO extends PatientRegisterDTO {
}

class AdministrationDTO implements AdministrationModelInterface {

  @ApiModelProperty({example: 'Admin@gmail.com'})
  @IsEmail()
  email: string;

  @ApiModelProperty({example: '9876545678'})
  @IsString()
  @IsNotEmpty()
  emiratesId: string;

  @ApiModelProperty({example: 'admin@123$'})
  @IsString()
  //At least 8 characters long;
  // One lowercase, one uppercase, one number and one special character;
  // No whitespaces.
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
  password: string;

  @ApiModelProperty({example: '+92-311-565-5807'})
  @IsPhoneNumber(null)
  phone: string;

  @ApiModelProperty({example: 'ADMIN'})
  @IsIn(['ADMIN', 'SUB_ADMIN'])
  role: UserRole;

}

export class AdminDTO extends AdministrationDTO implements AdminModelInterface {
  @ApiModelProperty({example: 'string'})
  @IsString()
  test: string
}

export class SubAdminDTO extends AdministrationDTO {
  @ApiModelPropertyOptional({description: 'subAdmin address', type: AddressDto})
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => AddressDto)
  addresses: AddressModelInterface;

  @ApiModelProperty({example: 'imxm', description: 'firstName'})
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiModelProperty({example: 'imxm', description: 'firstName'})
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiModelPropertyOptional({example: 'cb', description: 'userId'})
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profilePic: string;

  @ApiModelProperty({example: 'MALE'})
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender: string;
}