import {forwardRef, Module} from '@nestjs/common';
import {SchemasModule} from '../schemas/schemas.module';
import {DocumentService} from './document.service';
import {HelpersModule} from '../helpers/helpers.module';

@Module({
  imports: [
    forwardRef(() => SchemasModule),
    forwardRef(() => HelpersModule),
  ],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {
}
