import {Inject, Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/mongoose';
import {Connection} from 'mongoose';
import {TokenProvider} from './helpers/token-provider';
import {MongoChangeStream} from './decorators/Change-stream.decorator';
import {ChangeStreamInterface, ChangeType} from './interfaces/class.decorator.interface';
import {SubscribeStream} from './decorators/subcribe-stream';
import {ClientProxy} from '@nestjs/microservices';
import {MESSAGE_PATTERNS, MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {Utils} from './helpers/utils';


// TODO handle resuming
// TODO start syncing on Module init
@Injectable()
@MongoChangeStream
export class MongodbChangeStreamsService implements ChangeStreamInterface {
  constructor(
    @InjectConnection() private connection: Connection,
    private readonly tokenProvider: TokenProvider,
    @Inject(MICRO_SERVICE_INJECTION_TOKEN.ELASTIC_SEARCH) private client: ClientProxy,
    private readonly utils: Utils,
  ) {
  }

  async deleteStream(collection: string): Promise<any> {
    const resumeToken = await this.tokenProvider.getResumetoken('SOME_DELETE_TOKEN_ID');
    console.log('resumeToken', resumeToken);
    const changeStream = (await this.connection.collections[collection]).watch([
      {
        '$match': {
          'operationType': {
            '$in': ['delete'],
          },
        },
      },
      {
        '$project': {
          'documentKey': true,
        },
      },
    ], {'resumeAfter': resumeToken});

    return changeStream;
  }

  async changesStream(collection: string, changeType: ChangeType): Promise<any> {
    const resumeToken = await this.tokenProvider.getResumetoken('5f44e158a7f0867304641119');
    const changeStream = (await this.connection.collections[collection]).watch([
      {
        '$match': {
          'operationType': {
            '$in': [changeType],
          },
        },
      },
      {
        '$project': {
          'documentKey': false,
        },
      },
    ], {'resumeAfter': resumeToken, 'fullDocument': 'updateLookup'});

    return changeStream;
  }

  @SubscribeStream({collection: 'products', stream: ChangeType.UPDATE})
  updateStreamHandler(data: any) {
    console.log(data);
  }

  @SubscribeStream({collection: 'products', stream: ChangeType.DELETE})
  deleteStreamHandler(data: any) {
    console.log(data);
  }

  @SubscribeStream({collection: 'products', stream: ChangeType.REPLACE})
  replaceStreamHandler(data: any) {
    console.log(data);
  }


  @SubscribeStream({collection: 'products', stream: ChangeType.INSERT})
  async insertStreamHandler(data: any) {
    const payload = this.utils.transform(data.fullDocument);
    const res = await this.client.send(MESSAGE_PATTERNS.SYNC_PRODUCTS, payload)
      .toPromise();
    // console.log(res);
    // TODO if response is true, then update resume token
  }
}
