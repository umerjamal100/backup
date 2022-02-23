import {forwardRef, Module} from '@nestjs/common';
import {SchemasModule} from '../schemas/schemas.module';
import {SchemaHelper} from './schema.helper';
import {AuthHelper} from './auth.helper';
import {CloudWatchEvents, S3, SES, SNS} from 'aws-sdk';
import {ConfigService} from '../config/config.service';
import {AwsHelper} from './aws.helper';
import {StringUtils} from './utils/string.utils';
import {JwtModule} from '@nestjs/jwt';
import {GoogleHelper} from './google.helper';
import {OAuth2Client} from 'google-auth-library';
import axios, {AxiosRequestConfig} from 'axios';
import {FacebookHelper} from './facebook.helper';
import {FirebaseHelper} from './firebase.helper';
import {UsersHelper} from './users.helper';
import {ResponseUtils} from './utils/response.utils';
import {ProductHelper} from './product.helper';
import {DocumentsHelper} from './documents.helper';
import {AddressHelper} from './address.helper';
import {Client} from '@googlemaps/google-maps-services-js/dist';
import {GoogleMapsHelper} from './googleMaps.helper';
import {BucketService} from "../order/bucket.service";
import {ErrorUtils} from "./utils/error.utils";
import {PaymentBucketService} from "../order/paymentBucket.service";

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    // TODO get from constansts
    JwtModule.register({
      secret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
      signOptions: {expiresIn: '60 days'},
    }),
  ],
  providers: [
    BucketService,
    PaymentBucketService,
    SchemaHelper,
    AuthHelper,
    SchemaHelper,
    StringUtils,
    AwsHelper,
    GoogleHelper,
    GoogleMapsHelper,
    FacebookHelper,
    FirebaseHelper,
    UsersHelper,
    ResponseUtils,
    ErrorUtils,
    ProductHelper,
    AddressHelper,
    DocumentsHelper,
    {
      provide: 'S3',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<S3> => {
        return new S3({
          accessKeyId: configService.awsAccessKey,
          secretAccessKey: configService.awsSecretAccessKey,
          region: configService.awsS3Region,
        });
      },
    },
    {
      provide: 'SES',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<SES> => {
        return new SES({
          credentials: {
            accessKeyId: configService.awsAccessKey,
            secretAccessKey: configService.awsSecretAccessKey,
          },
          region: configService.awsSESRegion,
          apiVersion: 'latest',
        });
      },
    },
    {
      provide: 'SNS',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<SNS> => {
        return new SNS({
          credentials: {
            accessKeyId: configService.awsAccessKey,
            secretAccessKey: configService.awsSecretAccessKey,
          },
          region: configService.awsSNSRegion,
          apiVersion: 'latest',
        });
      },
    },
    {
      provide: 'CloudWatchEvents',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<CloudWatchEvents> => {
        return new CloudWatchEvents({
          credentials: {
            accessKeyId: configService.awsAccessKey,
            secretAccessKey: configService.awsSecretAccessKey,
          },
          region: configService.awsSNSRegion,
          apiVersion: 'latest',
        });
      },
    },
    {
      provide: OAuth2Client,
      useValue: new OAuth2Client(),
    },
    {
      provide: 'GraphApiAxios',
      useFactory: async () => {
        const api = axios.create({
          baseURL: 'https://graph.facebook.com/v8.0',
        });
        // api.interceptors.response.use(
        //   ({ data }: AxiosResponse) => data,
        //   (error: any) => error);
        api.interceptors.request.use(
          (data: AxiosRequestConfig) => {
            console.log(data);
            return data;
          },
          (error: any) => {
            console.log(error);
            return error;
          });
        return api;
      },
    },
    {
      provide: 'OauthApiAxios',
      useFactory: async () => {
        const api = axios.create({
          baseURL: 'https://graph.facebook.com/oauth',
        });
        // api.interceptors.response.use(
        //   ({ data }: AxiosResponse) => data,
        //   (error: any) => error);
        // api.interceptors.request.use(
        // (data: AxiosRequestConfig) => {
        //   console.log(data);
        //   return data;
        // },
        // (error: any) => {
        //   console.log(error);
        //   return error;
        // });
        return api;
      },
    },
    {provide: 'GoogleMapsClient', useValue: new Client({})},
    {
      provide: 'GoogleMapsKey', useFactory: ((config: ConfigService) => config.googleApiKey),
      inject: [ConfigService],
    },
  ],
  exports: [
    SchemaHelper,
    AuthHelper,
    SchemaHelper,
    AwsHelper,
    StringUtils,
    GoogleHelper,
    ErrorUtils,
    FacebookHelper,
    FirebaseHelper,
    UsersHelper,
    ResponseUtils,
    ProductHelper,
    AddressHelper,
    DocumentsHelper,
    GoogleMapsHelper,
  ],
})
export class HelpersModule {
}
