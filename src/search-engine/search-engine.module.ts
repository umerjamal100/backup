import {Module} from '@nestjs/common';
import {SearchEngineController} from './search-engine.controller';
import {SearchEngineService} from './search-engine.service';
import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {ConfigService} from '../config/config.service';
import {ConfigModule} from '../config/config.module';
import {ElasticSearchHelper} from './helpers/elasticSearch.helper';
import axios from 'axios';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        node: config.elasticSearchHostUrl,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchEngineController],
  providers: [
    SearchEngineService,
    ElasticSearchHelper,
    {
      provide: 'ElasticRestApi',
      useFactory: async (config: ConfigService) => {
        const api = axios.create({
          baseURL: config.elasticSearchHostUrl,
        });
        return api;
      },
      inject: [ConfigService]
    },

  ],
})
export class SearchEngineModule {
}
