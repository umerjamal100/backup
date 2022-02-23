import {Module} from '@nestjs/common';
import {AdminChatService} from './admin-chat.service';
import {AdminChatController} from './admin-chat.controller';
import {SchemasModule} from "../schemas/schemas.module";
import {ConfigModule} from "../config/config.module";
import {DatabaseModule} from "../database/database.module";

@Module({
  imports: [
    SchemasModule,
    ConfigModule,
    DatabaseModule
  ],
  controllers: [AdminChatController],
  providers: [AdminChatService],
  exports: [AdminChatService]
})
export class AdminChatModule {
}
