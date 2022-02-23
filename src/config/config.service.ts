import * as dotenv from 'dotenv';
import * as Joi from '@hapi/joi';
import {ConfigInterface} from './intefaces/config.interface';

export class ConfigService {
  private readonly envConfig: ConfigInterface;

  constructor() {
    dotenv.config();
    const config: {[name: string]: string} = process.env;
    const parsedConfig = JSON.parse(JSON.stringify(config));
    if (!config.SLACK_ALLOWED_REDIRECT_URI_LIST) {
      throw new Error('Environment Variable: SLACK_ALLOWED_REDIRECT_URI_LIST is required!');
    }
    parsedConfig.SLACK_ALLOWED_REDIRECT_URI_LIST = config.SLACK_ALLOWED_REDIRECT_URI_LIST.split(',');
    this.envConfig = this.validateInput(parsedConfig);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput = (envConfig): ConfigInterface => {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string().required()
        .valid('development', 'production', 'test', 'provision', 'inspection', 'staging', 'local')
        .default('development'),
      SERVER_PORT: Joi.number().required(),
      MONGO_URI: Joi.string().required(),
      JWT_SECRET: Joi.string().required(),
      AWS_ACCESS_KEY: Joi.string().required(),
      AWS_SECRET_ACCESS_KEY: Joi.string().required(),
      AWS_S3_REGION: Joi.string().required(),
      AWS_SES_REGION: Joi.string().required(),
      AWS_SNS_REGION: Joi.string().required(),
      AWS_BUCKET_URI: Joi.string().required(),
      AWS_BUCKET_NAME: Joi.string().required(),
      AWS_MAX_FILE_UPLOAD_SIZE_MB: Joi.number().required(),
      AWS_MAX_FILES_UPLOAD_ALLOW: Joi.number().required(),
      REDIS_URI: Joi.string().required(),
      SLACK_AUTHORIZATION_URI: Joi.string().uri().required(),
      SLACK_CLIENT_ID: Joi.string().required(),
      SLACK_CLIENT_SECRET: Joi.string().required(),
      SLACK_ALLOWED_REDIRECT_URI_LIST: Joi.array().items(Joi.string().required()).required(),
      SLACK_SCOPES: Joi.string().required(),
      GOOGLE_WEB_CLIENT_ID: Joi.string().required(),
      GOOGLE_WEB_CLIENT_SECRET: Joi.string().required(),
      GOOGLE_API_KEY: Joi.string().required(),
      GOOGLE_WEB_CALL_BACK_URL: Joi.string().uri().required(),
      GOOGLE_IOS_CLIENT_ID: Joi.string().required(),
      GOOGLE_ANDROID_CLIENT_ID: Joi.string().required(),
      MONGO_URI_TEST: Joi.string().required(),
      MAILGUN_API_KEY: Joi.string().required(),
      FRONTEND_APP_LINK: Joi.string().required(),
      ONESIGNAL_APP_ID: Joi.string().required(),
      ONESIGNAL_REST_API_KEY: Joi.string().required(),
      SLACK_BASE_URL: Joi.string().required(),
      TRELLO_AUTHORIZATION_URI: Joi.string().required(),
      TRELLO_TOKEN_EXPIRY: Joi.string().required(),
      TRELLO_APP_NAME: Joi.string().required(),
      TRELLO_SCOPES: Joi.string().required(),
      TRELLO_RESPONSE_TYPE: Joi.string().required(),
      TRELLO_API_KEY: Joi.string().required(),
      API_URL: Joi.string().required(),
      GITHUB_AUTHORIZATION_URI: Joi.string().required(),
      GITHUB_CLIENT: Joi.string().required(),
      GITHUB_SECRET: Joi.string().required(),
      GITHUB_REDIRECT_URL: Joi.string().required(),
      FACEBOOK_APP_ID: Joi.string().required(),
      FACEBOOK_APP_SECRET: Joi.string().required(),
      FACEBOOK_CALLBACK_URL: Joi.string().uri().required(),
      FIREBASE_PROJECT_ID: Joi.string().required(),
      FIREBASE_PRIVATE_KEY: Joi.string().required(),
      FIREBASE_CLIENT_EMAIL: Joi.string().required(),
      ELASTICSEARCH_HOST_URL: Joi.string().required(),
      ELASTICSEARCH_HOST: Joi.string().required(),
      ELASTIC_SEARCH_MICRO_SERVICE_PORT: Joi.number().required(),
      MONGO_OP_LOG_MICRO_SERVICE_PORT: Joi.number().required(),
      ORDER_MICRO_SERVICE_PORT: Joi.number().required(),
      KAFKA_PORT: Joi.number().required(),
    });

    const {error, value: validatedEnvConfig} = envVarsSchema.validate(
      envConfig,
      {
        abortEarly: false,
        allowUnknown: true,
      },
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  };

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get serverPort(): number {
    return this.envConfig.SERVER_PORT;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get mongoUri(): string {
    return this.envConfig.MONGO_URI;
  }

  get awsAccessKey(): string {
    return this.envConfig.AWS_ACCESS_KEY;
  }

  get awsSecretAccessKey(): string {
    return this.envConfig.AWS_SECRET_ACCESS_KEY;
  }

  get awsS3Region(): string {
    return this.envConfig.AWS_S3_REGION;
  }

  get awsS3BucketUri(): string {
    return this.envConfig.AWS_BUCKET_URI;
  }

  get awsS3BucketName(): string {
    return this.envConfig.AWS_BUCKET_NAME;
  }

  get awsSESRegion(): string {
    return this.envConfig.AWS_SES_REGION;
  }

  get awsSNSRegion(): string {
    return this.envConfig.AWS_SNS_REGION;
  }

  get awsMaxFileUploadSizeMb(): number {
    return this.envConfig.AWS_MAX_FILE_UPLOAD_SIZE_MB;
  }

  get awsMaxFilesUploadAllow(): number {
    return this.envConfig.AWS_MAX_FILES_UPLOAD_ALLOW;
  }

  get redisUri(): string {
    return this.envConfig.REDIS_URI;
  }

  get slackClientId(): string {
    return this.envConfig.SLACK_CLIENT_ID;
  }

  get slackClientSecret(): string {
    return this.envConfig.SLACK_CLIENT_SECRET;
  }

  get slackAllowedRedirectUriList(): string[] {
    return this.envConfig.SLACK_ALLOWED_REDIRECT_URI_LIST;
  }

  get slackAuthorizationUri(): string {
    return this.envConfig.SLACK_AUTHORIZATION_URI;
  }

  get slackScopes(): string {
    return this.envConfig.SLACK_SCOPES;
  }

  get googleWebClientId(): string {
    return this.envConfig.GOOGLE_WEB_CLIENT_ID;
  }

  get googleWebClientSecret(): string {
    return this.envConfig.GOOGLE_WEB_CLIENT_SECRET;
  }

  get googleApiKey(): string {
    return this.envConfig.GOOGLE_API_KEY;
  }

  get googleWebClientCallbackUrl(): string {
    return this.envConfig.GOOGLE_WEB_CALL_BACK_URL;
  }

  get googleIosClientId(): string {
    return this.envConfig.GOOGLE_IOS_CLIENT_ID;
  }

  get googleAndroidClientId(): string {
    return this.envConfig.GOOGLE_ANDROID_CLIENT_ID;
  }

  get mongoTestDb(): string {
    return this.envConfig.MONGO_URI_TEST;
  }

  get mailgunApiKey(): string {
    return this.envConfig.MAILGUN_API_KEY;
  }

  get frontendAppLink(): string {
    return this.envConfig.FRONTEND_APP_LINK;
  }

  get slackBaseUrl(): string {
    return this.envConfig.SLACK_BASE_URL;
  }

  get oneSignalAppId(): string {
    return this.envConfig.ONESIGNAL_APP_ID;
  }

  get oneSignalRestApiKey(): string {
    return this.envConfig.ONESIGNAL_REST_API_KEY;
  }

  get trelloAuthUri(): string {
    return this.envConfig.TRELLO_AUTHORIZATION_URI;
  }

  get trelloTokenExpiry(): string {
    return this.envConfig.TRELLO_TOKEN_EXPIRY;
  }

  get trelloAppName(): string {
    return this.envConfig.TRELLO_APP_NAME;
  }

  get trelloScopes(): string {
    return this.envConfig.TRELLO_SCOPES;
  }

  get trelloResponseType(): string {
    return this.envConfig.TRELLO_RESPONSE_TYPE;
  }

  get trelloApiKey(): string {
    return this.envConfig.TRELLO_API_KEY;
  }

  get apiURL(): string {
    return this.envConfig.API_URL;
  }

  get githubAuthUri(): string {
    return this.envConfig.GITHUB_AUTHORIZATION_URI;
  }

  get githubClient(): string {
    return this.envConfig.GITHUB_CLIENT;
  }

  get githubSecret(): string {
    return this.envConfig.GITHUB_SECRET;
  }

  get githubRedirectUrl(): string {
    return this.envConfig.GITHUB_REDIRECT_URL;
  }

  get facebookAppId(): string {
    return this.envConfig.FACEBOOK_APP_ID;
  }

  get facebookAppSecret(): string {
    return this.envConfig.FACEBOOK_APP_SECRET;
  }

  get facebookCallBackUrl(): string {
    return this.envConfig.FACEBOOK_CALLBACK_URL;
  }

  get firebaseProjectId(): string {
    return this.envConfig.FIREBASE_PROJECT_ID;
  }

  get firebasePrivateKey(): string {
    return this.envConfig.FIREBASE_PRIVATE_KEY;
  }

  get firebaseClientEmail(): string {
    return this.envConfig.FIREBASE_CLIENT_EMAIL;
  }

  get elasticSearchHostUrl(): string {
    return this.envConfig.ELASTICSEARCH_HOST_URL;
  }

  get elasticSearchHost(): string {
    return this.envConfig.ELASTICSEARCH_HOST;
  }

  get elasticSearchMicroServicePort(): number {
    return this.envConfig.ELASTIC_SEARCH_MICRO_SERVICE_PORT;
  }

  get mongoMonitorMicroServicePort(): number {
    return this.envConfig.MONGO_OP_LOG_MICRO_SERVICE_PORT;
  }

  get orderMicroServicePort(): number {
    return this.envConfig.ORDER_MICRO_SERVICE_PORT;
  }

  get kafkaPort(): number {
    return this.envConfig.KAFKA_PORT;
  }
}
