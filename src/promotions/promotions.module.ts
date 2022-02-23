import {forwardRef, Module} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import {SchemasModule} from "../schemas/schemas.module";
import {ConfigModule} from "../config/config.module";
import {DatabaseModule} from "../database/database.module";
import {HelpersModule} from "../helpers/helpers.module";

@Module({
  imports: [
    SchemasModule,
    ConfigModule,
    DatabaseModule,
    forwardRef(() => HelpersModule),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService]
})
export class PromotionsModule {}
