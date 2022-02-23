import {Test, TestingModule} from '@nestjs/testing';
import {AdminChatController} from './admin-chat.controller';
import {AdminChatService} from './admin-chat.service';

describe('AdminChatController', () => {
  let controller: AdminChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminChatController],
      providers: [AdminChatService],
    }).compile();

    controller = module.get<AdminChatController>(AdminChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
