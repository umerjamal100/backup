import {JwtService} from '@nestjs/jwt';
import {ConfigService} from '../config/config.service';
import {HttpStatus, Injectable, UnprocessableEntityException} from '@nestjs/common';
import {RedisService} from 'nestjs-redis';
import {AwsHelper} from './aws.helper';
import {StringUtils} from './utils/string.utils';
import {OTPTimeout} from '../common/constants.common';
import {IDP} from '../auth/types/interfaces/auth.interface';
import {GoogleHelper} from './google.helper';
import {HttpErrors} from '../common/errors';
import {IDPProfileInterface} from './interfaces/auth.helper';
import {FirebaseHelper} from './firebase.helper';
import {FacebookIdToken} from './interfaces/firebase.interface';

@Injectable()
export class AuthHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly awsHelper: AwsHelper,
    private readonly stringUtils: StringUtils,
    private readonly googleHelper: GoogleHelper,
    private readonly firebaseHelper: FirebaseHelper,
  ) {
  }

  generateToken(payload: any): string {
    return this.jwtService.sign(payload); /*, { expiresIn: env.JWT_EXPIRES_IN }*/
  }

  refreshToken(token: string): string {
    const payload = this.jwtService.verify(token);
    return this.generateToken({userId: payload.userId});
  }

  checkToken(token: string): boolean {
    try {
      this.jwtService.verify(token, {secret: this.configService.jwtSecret});
      return true;
    } catch (error) {
      return false;
    }
  }

  async sendOTP(phone: string, email?: string): Promise<{message: string}> {
    const code = await this.stringUtils.generateRandomNumber(6);
    try {
      const redisClient = await this.redisService.getClient();
      if (email) {
        const emailCodeOK = await (await this.redisService.getClient()).set(email, code, 'EX', OTPTimeout);
        if (emailCodeOK === 'OK')
          await this.awsHelper.confirmEmail(code, email, email.split('@')[0]);
      }
      if (phone) {
        const phoneCodeOK = await redisClient.set(phone, code, 'EX', OTPTimeout);
        if (phoneCodeOK === 'OK')
          await this.awsHelper.sendSMS(phone.split('-').join(''), `your OTP ${code}`, 'OTP');
      }
      return {
        message: 'please check OTP',
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    try {
      const redisClient = await this.redisService.getClient();
      const storedCode = await redisClient.get(phone);
      if (storedCode === code) {
        await redisClient.del(phone);
        return storedCode === code;
      }
      return false
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async socialLoginDispatcher(provider: IDP, idToken: string): Promise<any> {
    switch (provider) {
      case IDP.GOOGLE:
        return this.googleLogin(idToken);
      case IDP.FACEBOOK:
        return this.facebookLogin(idToken);
    }
  }

  async googleLogin(idToken: string): Promise<IDPProfileInterface> {
    try {
      const response = await this.googleHelper.verifyIdToken(
        idToken,
      );
      const userData = response.getPayload();
      const userId = response.getUserId();
      const email = userData.email;
      return {
        email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        userId,
        IDP: IDP.GOOGLE,
        profile: userData.picture,
      }

    } catch (e) {
      console.log(e);
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: HttpErrors.UNPROCESSABLE_ENTITY,
        message: 'Unable to verify idToken against given platform!',
      });
    }
  }

  /***
   *
   * @param idToken is firebase idToken
   */
  async facebookLogin(idToken: string): Promise<IDPProfileInterface> {
    try {
      const user: FacebookIdToken = await this.firebaseHelper.verifyIdToken(idToken) as unknown as FacebookIdToken;
      return {
        userId: user.firebase.identities[user.firebase.sign_in_provider][0],
        IDP: IDP.FACEBOOK,
        email: user.email || `${user.firebase.identities[user.firebase.sign_in_provider][0]}@${user.firebase.sign_in_provider}`,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1],
        profile: user.picture,
      }
    } catch (e) {
      console.error(e);
      throw new UnprocessableEntityException()
    }
  }

  async blackListToken(token: string, exp: number): Promise<any> {
    try {
      const client = await this.redisService.getClient();
      const blackListed = await client.set(`JWT:${token}`, token);
      await client.expireat(`JWT:${token}`, exp);
      console.log(blackListed);
      return blackListed;
    } catch (e) {
      console.error(e);
    }
  }

  async isTokenBlackListed(token: string): Promise<boolean> {
    try {
      const client = await this.redisService.getClient();
      const blackListed = await client.get(`JWT:${token}`);
      return blackListed as unknown as boolean;
    } catch (e) {
      console.error(e);
    }
  }
}