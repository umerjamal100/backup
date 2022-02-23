import {Module} from '@nestjs/common';
import {SchemasModule} from "../../schemas/schemas.module";
import {RiderController} from "./rider.controller";
import {HelpersModule} from "../../helpers/helpers.module";
import {RiderService} from "./rider.service";

@Module({
  imports: [SchemasModule, HelpersModule],
  controllers: [RiderController],
  providers: [RiderService],
})
export class RiderModule {
}
