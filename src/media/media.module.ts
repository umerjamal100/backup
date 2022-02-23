import {forwardRef, Module} from '@nestjs/common';
import {MediaService} from './media.service';
import {MediaController} from './media.controller';
import {HelpersModule} from '../helpers/helpers.module';
import {SchemasModule} from '../schemas/schemas.module';
import {PharmacyModule} from '../pharmacy/pharmacy.module';
import {DocumentModule} from '../document/document.module';

@Module({
  imports: [
    forwardRef(() => HelpersModule),
    forwardRef(() => SchemasModule),
    forwardRef(() => PharmacyModule),
    forwardRef(() => DocumentModule),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {
}
