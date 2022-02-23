import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as compression from 'compression';
import * as helmet from 'helmet';
import {ConfigService} from './config/config.service';
import * as morgan from 'morgan';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as passport from 'passport';
import * as session from 'express-session';
import * as flash from 'connect-flash';
import {NestExpressApplication} from '@nestjs/platform-express';
import {nodeEnv, sessionName} from './common/constants.common';
import * as admin from 'firebase-admin';
import {ServiceAccount} from 'firebase-admin';
import {Transport} from '@nestjs/microservices';
import {MongodbChangeStreamsModule} from './mongodb-change-streams/mongodb-change-streams.module';
import {SearchEngineModule} from './search-engine/search-engine.module';
import {OrderModule} from './order/order.module';
/* eslint-disable */
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors')

/* eslint-enable */

async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const adminConfig: ServiceAccount = {
    "projectId": configService.firebaseProjectId,
    "privateKey": configService.firebasePrivateKey.replace(/\\n/g, '\n'),
    "clientEmail": configService.firebaseClientEmail,
  };

  // const corsOptions = {
  //   origin: ['http://localhost:3000', 'http://192.168.100.200:3000'],
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  //   // allowedHeaders: [ "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  //   credentials: true
  // }
  // app.use(cors(corsOptions))
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Deep Dive')
    .setDescription('deep dive')
    .setVersion('1.0')
    .addTag('Auth', 'Auth API Endpoints!')
    .addTag('Media', 'Media API Endpoints!')
    .addTag('Pharmacy', 'Pharmacy API Endpoints!')
    .addTag('Product', 'Pharmacy API Endpoints!')
    .addTag('Advertisement', 'Advertisement API Endpoints!')
    .addTag('Order', 'Order API Endpoints!')
    .setBasePath('api')
    .setSchemes((configService.nodeEnv === nodeEnv.LOCAL) ? 'http' : 'https')
    // .setSchemes('https')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  if (configService.nodeEnv !== nodeEnv.PRODUCTION) {
    SwaggerModule.setup('api/docs', app, document);
  }

  app.use(compression());
  app.use(helmet());
  if (configService.nodeEnv !== nodeEnv.PRODUCTION) {
    app.enableCors({
      origin: ['http://localhost:3000', 'http://192.168.100.200:3000', 'http://18.217.11.148', 'https://develop.admin.boon247.com', 'http://develop.admin.boon247.com'],
      credentials: true,
    });
  }
  app.use(morgan('dev'));
  // tslint:disable-next-line:no-magic-numbers
  const store = new MongoDBStore({
    uri: configService.mongoUri, // This will come from the env file
    collection: 'sessions',
  });
  // use sessions
  const sessionOptions = {
    name: sessionName,
    secret: configService.jwtSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      originalMaxAge: 1000 * 60 * 60 * 24 * 30, // 30 days session
      httpOnly: false,
      secure: false,
    },
    store,
    trustProxy: false
  };
  if (configService.nodeEnv !== nodeEnv.DEVELOPMENT) {
    sessionOptions.trustProxy = true;
    app.enable('trust proxy');
  }
  app.use(session(sessionOptions));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  await app.listen(configService.serverPort);
  console.log('The app is up on port:', configService.serverPort);

  // run mongo db change monitor to update elastic search index
  // TODO write fallback if any of the service is unavailable instead giving the error
  const mongoConnector = await NestFactory.createMicroservice(
    MongodbChangeStreamsModule,
    {
      transport: Transport.TCP,
      options: {
        port: configService.mongoMonitorMicroServicePort
      }
    },
  );

  const elasticSearchEngine = await NestFactory.createMicroservice(
    SearchEngineModule,
    {
      transport: Transport.TCP,
      options: {
        port: configService.elasticSearchMicroServicePort
      }
    },
  );

  const orderMicroService = await NestFactory.createMicroservice(
    OrderModule,
    {
      transport: Transport.TCP,
      options: {
        port: configService.orderMicroServicePort,
      }
    },
  );

  elasticSearchEngine.listenAsync();
  mongoConnector.listenAsync();
  orderMicroService.listenAsync();
  return app;
}

bootstrap();
