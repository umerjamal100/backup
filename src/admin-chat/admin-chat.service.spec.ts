import {Test, TestingModule} from '@nestjs/testing';
import {AdminChatService} from './admin-chat.service';

describe('AdminChatService', () => {
  let service: AdminChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminChatService],
    }).compile();

    service = module.get<AdminChatService>(AdminChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
