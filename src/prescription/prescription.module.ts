import {forwardRef, Module} from '@nestjs/common';
import {PrescriptionService} from './prescription.service';
import {PrescriptionController} from './prescription.controller';
import {SchemasModule} from '../schemas/schemas.module';
import {DocumentModule} from '../document/document.module';

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    forwardRef(() => DocumentModule),
  ],
  providers: [PrescriptionService],
  controllers: [PrescriptionController]
})
export class PrescriptionModule {
}
