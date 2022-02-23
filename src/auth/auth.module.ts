import {forwardRef, HttpModule, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {HelpersModule} from '../helpers/helpers.module';
import {SchemasModule} from '../schemas/schemas.module';
import {VerifyPhoneStrategy} from './passport/verifyPhone.strategy';
import {VerifyEmailStrategy} from './passport/verifyEmail.strategy';
import {JwtStrategy} from './passport/jwt.strategy';
import {FacebookStrategy} from './passport/facebook.strategy';
import {UsersModule} from '../users/users.module';
import {GoogleStrategy} from './passport/google.strategy';
import {LocalStrategy} from './passport/local.strategy';
import {AdminStrategy} from './passport/Admin.strategy';
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from '../config/config.service';
import {JwtGuard} from './guards/jwt.guard';
import {SessionSerializer} from './passport/serializers/session.sereializer';
import {SocialLoginGuard} from './guards/socialLogin.guard';
import {SocialStrategy} from './passport/social.strategy';
import {PharmacyModule} from '../pharmacy/pharmacy.module';
import {AdminModule} from "../admin/admin.module";

@Module({
  imports: [
    AdminModule,
    forwardRef(() => HelpersModule),
    forwardRef(() => UsersModule),
    forwardRef(() => HttpModule),
    forwardRef(() => PharmacyModule),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {expiresIn: '60d'},
      }),
      inject: [ConfigService],
    }),
    SchemasModule
  ],
  providers: [
    AuthService,
    VerifyPhoneStrategy,
    VerifyEmailStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    LocalStrategy,
    AdminStrategy,
    JwtGuard,
    SocialLoginGuard,
    SocialStrategy,
    SessionSerializer
  ],
  controllers: [AuthController],
  exports: [SessionSerializer]
})
export class AuthModule {

}
