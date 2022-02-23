import {ConfigModule} from '../config/config.module';
import {ConfigService} from '../config/config.service';
import {MongooseModule} from '@nestjs/mongoose';

export const databaseProviders = [
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      uri: config.mongoUri,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      poolSize: 20,
    }),
  }),
];
