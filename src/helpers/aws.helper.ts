// helper for aws API;
import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {S3, SES, SNS} from 'aws-sdk';
import {ConfigService} from '../config/config.service';
import {Buckets, FileInterface, UploadFileResponseInterface} from './interfaces/aws.helper.interface';
import {HttpErrors} from '../common/errors';
import {mimeTypesArray, OTPEmailSender} from '../common/constants.common';
import confirmEmailTemplate from '../common/emails/signup.template';
import forgotPasswordEmailTemplate from '../common/emails/forgot-password.template';
import {StringUtils} from './utils/string.utils';

@Injectable()
export class AwsHelper {
  private uploadParams = {
    Bucket: this.configService.awsS3BucketName,
    contentDisposition: 'inline',
    ACL: 'public-read',
    Key: '',
    Body: undefined,
    contentType: '',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly stringUtils: StringUtils,
    @Inject('S3')
    private readonly s3: S3,
    @Inject('SES')
    private readonly ses: SES,
    @Inject('SNS')
    private readonly sns: SNS,
  ) {
  }

  async uploadMultiple(files: FileInterface[], platform: string, bucket: string): Promise<UploadFileResponseInterface[]> {
    const fileNames: UploadFileResponseInterface[] = [];
    const promises = [];
    if (files.length > this.configService.awsMaxFilesUploadAllow) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: HttpErrors.UNPROCESSABLE_ENTITY,
        message: `Only ${this.configService.awsMaxFilesUploadAllow} files are allowed to upload through this endpoint!`,
      });
    }
    for (const file of files) {
      const fileName = await this.checkPreConditions(file, platform);
      fileNames.push({
        name: file.originalname,
        url: encodeURIComponent(fileName),
        type: file.mimetype,
      });
      this.uploadParams.Key = fileName;
      this.uploadParams.Body = file.buffer;
      this.uploadParams.contentType = file.mimetype;
      if (bucket !== Buckets.PROFILE) {
        delete this.uploadParams.ACL;
        this.uploadParams.Bucket = bucket;
      }
      promises.push(this.s3.upload(this.uploadParams).promise());
    }
    return await Promise.all(promises)
      .then(() => fileNames)
      .catch((error) => {
        console.warn(error);
        throw new InternalServerErrorException();
      });
  }

  async uploadSingle(file: FileInterface, platform: string): Promise<UploadFileResponseInterface> {
    const fileName = await this.checkPreConditions(file, platform);
    this.uploadParams.Body = file.buffer;
    this.uploadParams.Key = fileName;
    this.uploadParams.contentType = file.mimetype;
    return this.s3.upload(this.uploadParams).promise()
      .then(() => {
        return {
          name: file.originalname,
          url: decodeURIComponent(fileName),
          type: file.mimetype,
        };
      })
      .catch((error) => {
        console.warn(error);
        throw new InternalServerErrorException();
      });
  }

  async checkPreConditions(file, platform: string): Promise<string> {
    const fileSizeInMb = file.size / 1000000;
    if (fileSizeInMb > this.configService.awsMaxFileUploadSizeMb) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: HttpErrors.UNPROCESSABLE_ENTITY,
        message: `${file.originalname} has size ${fileSizeInMb} MB which is greater than allowed upload size i.e. ${this.configService.awsMaxFileUploadSizeMb} MB!`,
      });
    }
    if (!mimeTypesArray.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        error: HttpErrors.UNSUPPORTED_MEDIA_TYPE,
        message: `Allowed Media Types: ${mimeTypesArray}`,
      });
    }
    const randomString = this.stringUtils.generateRandomString(4);
    return platform + '_' + Date.now().toString() + '_' + randomString + '_' + file.originalname;
  }

  // this function is necessary for unit tests
  getUploadPrams(): any {
    return this.uploadParams;
  }

  async confirmEmail(code: string, toEmail: string, name: string, emailRetries = 4): Promise<boolean> {
    emailRetries--;
    if (emailRetries <= 0) {
      return Promise.resolve(false);
    }

    const verifyLinkToSend = code;

    const mailParams: SES.Types.SendEmailRequest = {
      Source: OTPEmailSender,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: confirmEmailTemplate(verifyLinkToSend, name),
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Email verification',
        },
      },
    };

    this.ses.sendEmail(mailParams).promise().then((response) => {
      return Promise.resolve(true);
    }).catch(async (e) => {
      console.warn(e);
      await this.confirmEmail(code, toEmail, name, emailRetries);
    });
  }

  async forgotPasswordEmail(toEmail: string, name: string, code: string, emailRetries = 4): Promise<boolean> {

    emailRetries--;
    if (emailRetries <= 0) {
      return Promise.resolve(false);
    }

    const mailParams: SES.Types.SendEmailRequest = {
      Source: 'support@conzia.com',
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: forgotPasswordEmailTemplate(name, code),
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Dont worry, you can reboot',
        },
      },
    };

    this.ses.sendEmail(mailParams).promise().then((response) => {
      return Promise.resolve(true);
    }).catch(async (e) => {
      console.warn(e);
      await this.forgotPasswordEmail(toEmail, name, code, emailRetries);
    });
  }

  async sendSMS(phone: string, text: string, subject: string, retries = 4): Promise<any> {
    // console.log(this.sns);
    if (retries <= 0) {
      return Promise.resolve(false);
    }
    const params = {
      Message: text,
      PhoneNumber: phone,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          'DataType': 'String',
          'StringValue': subject,
        },
      },
    };
    this.sns.publish(params).promise()
      .then(res => {
        return Promise.resolve(true);
      })
      .catch(async e => {
        console.warn(e);
        await this.sendSMS(phone, text, subject, --retries);
      });
  }

  async getSignedUrl(fileName: string, bucket: Buckets): Promise<string> {
    try {
      const url = await this.s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: fileName,
        Expires: 60 * 60 * 1, // 1 hr
      });
      return url;
    } catch (e) {
      console.error(e);
      throw new UnprocessableEntityException();
    }
  }
}
