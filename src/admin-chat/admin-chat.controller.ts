import {Controller} from '@nestjs/common';
import {AdminChatService} from './admin-chat.service';

@Controller('admin-chat')
export class AdminChatController {
  constructor(private readonly adminChatService: AdminChatService) {
  }


}
