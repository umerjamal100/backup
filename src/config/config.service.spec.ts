import {Test, TestingModule} from '@nestjs/testing';
import {ConfigService} from './config.service';

describe('ConfigService test', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('node_env should be defined', () => {
    expect(['development', 'production', 'test', 'provision', 'staging', 'local']).toContain(service.nodeEnv);
  });

  it('mongoUri should be defined', () => {
    expect(typeof service.mongoTestDb).toBe('string');
  });

  it('serverPort should be defined', () => {
    expect(service.serverPort).toBe(4000);
  });
});
