import {Test, TestingModule} from '@nestjs/testing';
import {MongodbChangeStreamsService} from './mongodb-change-streams.service';

describe('MongodbChangeStreamsService', () => {
  let service: MongodbChangeStreamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongodbChangeStreamsService],
    }).compile();

    service = module.get<MongodbChangeStreamsService>(MongodbChangeStreamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
