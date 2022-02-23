import {forwardRef, Module} from '@nestjs/common';
import {RiderService} from "./rider.service";
import {RiderController} from "./rider.controller";
import {SchemasModule} from "../schemas/schemas.module";
import {HelpersModule} from "../helpers/helpers.module";
import {PharmacyModule} from "../pharmacy/pharmacy.module";
import {OrderModule} from "../order/order.module";

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    forwardRef(() => HelpersModule),
    forwardRef(() => PharmacyModule),
    forwardRef(() => OrderModule),

  ],
  providers: [RiderService],
  controllers: [RiderController],
  exports: [RiderService]
})
export class RiderModule {
}
