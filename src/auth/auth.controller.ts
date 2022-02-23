import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiUseTags} from '@nestjs/swagger';
import {
  AdminDTO,
  LoginDto,
  LoginParams,
  PatientRegisterDTO,
  RegisterPharmacyDTO,
  RegisterRiderDTO,
  ResendOTPEmail,
  ResendOTPPhone,
  ResetPasswordDto,
  SocialLoginDTO,
  SubAdminDTO,
  VerifyEmailDTO,
  VerifyEmailQuery,
  VerifyPhoneDTO,
} from './types/dto/auth.dto';
import {BadRequestForResetPassword, InternalServerErrorWithMessage} from '../common/responses.common';
import {HttpErrors} from '../common/errors';
import {ResetPasswordSuccessResponse} from './types/responses/auth.response';
import {LoginGuard} from './guards/passport-session.guard';
import {VerifyEmailGuard} from './guards/verifyEmail.guard';
import {AuthenticatedGuard} from './guards/Authenticated.guard';
import {VerifyPhoneGuard} from './guards/verifyPhone.guard';
import {SocialLoginGuard} from './guards/socialLogin.guard';
import {User} from '../schemas/interfaces/user.interface';

@ApiUseTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {
  }

  @Get('/status')
  async healthCheck() {
    return
  }

  @HttpCode(HttpStatus.OK)
  @Post('register/patient')
  async registerPatient(@Body() body: PatientRegisterDTO, @Req() req): Promise<any> {
    return this.authService.registerPatient(body);
  }

  @Post('register/admin')
  async registerAdmin(@Body() body: AdminDTO, @Req() req): Promise<any> {
    return this.authService.registerAdmin(body)
  }

  @Post('register/subAdmin')
  async registerSubAdmin(@Body() body: SubAdminDTO, @Req() req): Promise<any> {
    return this.authService.registerSubAdmin(body)
  }

  @Post('register/pharmacy')
  async registerPharmacy(@Body() body: RegisterPharmacyDTO): Promise<any> {
    return this.authService.registerPharmacy(body);
  }

  @Post('register/rider')
  async registerRider(@Body() body: RegisterRiderDTO): Promise<any> {
    return this.authService.registerRider(body);
  }

  @UseGuards(VerifyPhoneGuard)
  @Post('verify/phone')
  async verifyPhone(@Body() body: VerifyPhoneDTO, @Req() req): Promise<any> {
    const user = req.user;
    delete user.password;
    return user;
  }

  @UseGuards(VerifyEmailGuard)
  @Post('verify/email')
  async verifyEmail(@Body() body: VerifyEmailDTO, @Req() req, @Query() query: VerifyEmailQuery): Promise<any> {
    const user = req.user;
    delete user.password;
    return user;
  }

  @UseGuards(LoginGuard)
  @Post('login/:userRole')
  async login(@Body() body: LoginDto, @Req() req, @Param() params: LoginParams): Promise<any> {
    const user = req.user;
    delete user.password;
    return user;
  }

  @Post('resendOTP/phone')
  async resendOtpPhone(@Body() body: ResendOTPPhone): Promise<any> {
    return this.authService.resendOtp(body)
  }

  @Post('resendOTP/email')
  async resendOtpEmail(@Body() body: ResendOTPEmail): Promise<any> {
    return this.authService.resendOtp(body)
  }

  // post endpoint for reset-password!
  @Post('reset-password')
  // decorators for API documentation!
  @ApiCreatedResponse({description: 'Password Updated Successfully!', type: ResetPasswordSuccessResponse})
  @ApiBadRequestResponse({description: 'Invalid Code or Expired Code!', type: BadRequestForResetPassword})
  @ApiInternalServerErrorResponse({
    description: HttpErrors.INTERNAL_SERVER_ERROR,
    type: InternalServerErrorWithMessage,
  })
  // controller function to handle reset-password endpoint request!
  async resetPassword(@Body() body: ResetPasswordDto): Promise<string> {
    return await this.authService.resetPassword(body);
  }

  @UseGuards(SocialLoginGuard)
  @Post('social')
  async socialLogin(@Body() body: SocialLoginDTO, @Req() req): Promise<User> {
    const user = req.user;
    delete user.password;
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  async logout(@Req() req): Promise<any> {
    req.logout();
  }

}
