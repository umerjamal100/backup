import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {User, UserModelStructure} from '../schemas/interfaces/user.interface';
import {Model} from 'mongoose';
import {UserRole} from '../common/enum.common';
import {GuestLoginBody, PhoneEmailInterface, VerifyEmail} from './types/interfaces/auth.interface';
import {AuthHelper} from '../helpers/auth.helper';
import {
  AdminDTO,
  LoginDto,
  RegisterPharmacyDTO,
  RegisterRiderDTO,
  ResetPasswordDto,
  SocialLoginDTO,
  SubAdminDTO
} from './types/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import {AwsHelper} from '../helpers/aws.helper';
import {OTPTimeout} from '../common/constants.common';
import {HttpErrors} from '../common/errors';
import {IDPProfileInterface} from '../helpers/interfaces/auth.helper';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {PharmacyService} from '../pharmacy/pharmacy.service';
import {LoginModelStructure} from '../schemas/login.schema';
import {PharmacyModelInterface} from '../schemas/pharmacy.schema';
import {RiderModelStructure} from "../schemas/rider.schema";
import {AdminService} from "../admin/admin.service";
import {AdminModelStructure, SubAdminModelStructure} from "../schemas/admin.schema";
import * as _ from 'lodash'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserModelStructure>,
    @InjectModel('Login')
    private readonly loginModel: Model<LoginModelStructure>,
    @InjectModel('Rider')
    private readonly riderModel: Model<RiderModelStructure>,
    @InjectModel('admin')
    private readonly adminModel: Model<AdminModelStructure>,
    @InjectModel('subAdmin')
    private readonly subAdminModel: Model<SubAdminModelStructure>,
    private readonly authHelper: AuthHelper,
    private readonly awsHelper: AwsHelper,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly pharmacyService: PharmacyService,
    private readonly adminService: AdminService,
  ) {
  }

  async registerPatient(body) {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [{phone: body.phone}, {email: body.email}],
      });
      if (existingUser) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          code: 409,
          message: 'user already exists', // TODO get message from constants
        });
      }

      const newUser = new this.userModel({
        // emiratesId: body.emiratesId,
        phone: body.phone,
        email: body.email,
        password: bcrypt.hashSync(body.password, 8),
        // firstName: body.firstName,
        // lastName: body.lastName,
        role: UserRole.Patient,
        // addresses: body.addresses ? [{ addressName: body.addresses }] : [],
        // code: Math.floor(1000 + Math.random() * 9000), // todo: will later be implemented
      });

      // TODO send OTP in async way
      this.authHelper.sendOTP(body.phone, body.email).catch(e => console.log(e));

      const savedUser = (await newUser.save()).toObject();
      const {password, ...elsee} = savedUser;
      return {...elsee, OTPTimeout: OTPTimeout};
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * registration function is only ued for login info,  profile creation is done in pharacy module
   */
  async registerPharmacy(data: RegisterPharmacyDTO): Promise<any> {
    const pharmacy = await this.pharmacyService.getPharmacyById(data.pharmacyId);
    if (!pharmacy) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: HttpErrors.UNPROCESSABLE_ENTITY,
        message: 'Register pharmacy before creating its signup',
      });
    }

    const pharmacyAuth = await this.loginModel.findOne({email: data.email}).lean();
    if (pharmacyAuth) {
      throw new ConflictException({
        status: HttpStatus.CONFLICT,
        error: HttpErrors.CONFLICT,
        message: 'Pharmacy signup info already exists',
      });
    }

    const {password, email, pharmacyId} = data;

    const newPharmacyAuth = (await this.loginModel.create({
      userName: email,
      role: UserRole.Pharmacy,
      password: bcrypt.hashSync(password, 8),
      user: pharmacyId,
    })).toObject();

    // send OTP method have first args as compulsory
    this.authHelper.sendOTP('', email);
    return newPharmacyAuth;

  }

  /**
   * registration function is only ued for login info,  profile creation is done in rider module
   */
  async registerRider(body: RegisterRiderDTO): Promise<any> {
    try {
      const existingUser = await this.riderModel.findOne({
        $or: [{phone: body.phone}, {email: body.email}],
      });
      if (existingUser) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          code: 409,
          message: 'user already exists', // TODO get message from constants
        });
      }

      const newRider = new this.riderModel({
        // emiratesId: body.emiratesId,
        phone: body.phone,
        email: body.email,
        password: bcrypt.hashSync(body.password, 8),
        // firstName: body.firstName,
        // lastName: body.lastName,
        role: UserRole.Rider,
        // addresses: body.addresses ? [{ addressName: body.addresses }] : [],
        // code: Math.floor(1000 + Math.random() * 9000), // todo: will later be implemented
      });

      // TODO send OTP in async way
      this.authHelper.sendOTP(body.phone, body.email).catch(e => console.log(e));

      const savedUser = (await newRider.save()).toObject();
      const {password, ...elsee} = savedUser;
      return {...elsee, OTPTimeout: OTPTimeout};
    } catch (e) {
      console.log(e);
      throw e;
    }

  }

  async registerAdmin(body: AdminDTO): Promise<any> {
    try {
      const admin = await this.adminService.createAdmin(body)
      delete admin.password
      return admin
    } catch (e) {
      throw new UnprocessableEntityException(e.toString())
    }
  }

  async registerSubAdmin(body: SubAdminDTO): Promise<any> {
    try {
      const subAdmin = await this.adminService.createSubAdmin(body)
      delete subAdmin.password
      return subAdmin
    } catch (e) {
      throw new UnprocessableEntityException(e.toString())
    }
  }

  async verifyPhone(body: GuestLoginBody): Promise<User> {
    const verified: boolean = await this.authHelper.verifyPhone(body.phone, body.code);
    if (!verified) {
      throw new ForbiddenException();
    }
    const user: User = await this.userModel.findOneAndUpdate({phone: body.phone}, {$set: {phoneVerified: true}}, {
      lean: true,
      new: true,
    });
    return user;
    // TODO keep in mind RBAC
    const token = this.authHelper.generateToken({role: user.role, user: user._id});
  }

  async verifyEmail(body: VerifyEmail, userType: UserRole = UserRole.Patient): Promise<User | PharmacyModelInterface> {
    // this method excepts string as key
    const verified: boolean = await this.authHelper.verifyPhone(body.email, body.code);
    if (!verified) {
      throw new ForbiddenException();
    }

    if (userType === UserRole.Pharmacy) {
      const pharmacyAuth = await this.loginModel.findOneAndUpdate({userName: body.email}, {isVerified: true}, {lean: true});
      const pharmacy = await this.pharmacyService.getPharmacyById(pharmacyAuth.user.toString() as string);
      return {...pharmacy, role: UserRole.Pharmacy};
    }

    const user: User = await this.userModel.findOneAndUpdate({email: body.email}, {$set: {emailVerified: true}}, {
      lean: true,
      new: true,
    });
    return user;
  }

  async login(body: LoginDto, params = UserRole.Patient) {
    const {username, password} = body;

    let user;
    if (params === UserRole.Pharmacy) {
      user = await this.loginModel.findOne({userName: body.username, isVerified: true}).lean();
    } else if (params === UserRole.Patient) {
      user = await this.userModel.findOne({
        $or: [{email: username}, {phone: username}],
      }).lean();
    } else if (params === UserRole.Rider) {
      user = await this.riderModel.findOne({
        $or: [{email: username}, {phone: username}],
      }).lean();
    } else if (params === UserRole.Admin) {
      user = await this.adminModel.findOne({
        $or: [{email: username}, {phone: username}],
      }).lean();
    } else if (params === UserRole.SubAdmin) {
      user = await this.subAdminModel.findOne({
        $or: [{email: username}, {phone: username}],
      }).lean();
    }
    if (user) {
      console.log(user.password);
      if (!bcrypt.compareSync(password, user.password)) {
        throw  new UnauthorizedException({
          status: HttpStatus.UNAUTHORIZED,
          code: 401,
          message: 'user not authorized',
        });
      }
      return user;
    } else {
      throw  new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        code: 401,
        message: 'user not authorized',
      });
    }
  }

  async resendOtp(body: PhoneEmailInterface): Promise<{status: number; code: number, message: string}> {
    const user = await this.userModel.findOne({
      ...(body.email && {email: body.email}),
      ...(body.phone && {phone: body.phone})
    });
    if (_.isEmpty(user)) {
      return {
        status: HttpStatus.OK,
        code: 200,
        message: 'please register first',
      };
    }
    await this.authHelper.sendOTP(body.phone, body.email);
    return {
      status: HttpStatus.OK,
      code: 200,
      message: 'OTP sent',
    };
  }

  async resetPassword(resetInfo: ResetPasswordDto): Promise<any> {
    try {
      const user = resetInfo.email ? resetInfo.email : resetInfo.phone;
      const isVerified = await this.authHelper.verifyPhone(user, resetInfo.code);
      if (isVerified) {
        const password = bcrypt.hashSync(resetInfo.password, 8);
        const user = await this.userModel.findOneAndUpdate({
          $or: [{
            ...(resetInfo.email && {
              email: resetInfo.email,
            }),
            ...(resetInfo.phone && {
              phone: resetInfo.phone,
            })
          }],
        }, {password});
        return {
          access_token: this.authHelper.generateToken({role: user.role, user: user._id}),
        };
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: HttpErrors.BAD_REQUEST,
          message: 'Invalid Code!',
        });
      }
    } catch (e) {
      throw e
    }
  }

  async socialLogin(data: SocialLoginDTO): Promise<User> {
    const profile: IDPProfileInterface = await this.authHelper.socialLoginDispatcher(data.provider, data.idToken);
    const user = await this.usersService.findOrCreate(profile);
    if (!user) {
      throw new UnprocessableEntityException();
    }
    return user;
  }

}
