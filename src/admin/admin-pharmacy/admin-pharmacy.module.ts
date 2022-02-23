import {Module} from '@nestjs/common';
import {AdminPharmacyService} from './admin-pharmacy.service';
import {AdminPharmacyController} from './admin-pharmacy.controller';
import {PharmacyModule} from "../../pharmacy/pharmacy.module";
import {SchemasModule} from "../../schemas/schemas.module";

@Module({
  imports: [PharmacyModule, SchemasModule],
  controllers: [AdminPharmacyController],
  providers: [AdminPharmacyService]
})
export class AdminPharmacyModule {
}
