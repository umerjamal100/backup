import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule} from '../../config/config.module';
import {ConfigService} from '../../config/config.service';

export const testDbProvider = [
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      uri: config.mongoTestDb,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      poolSize: 20,
    }),
  }),
];
