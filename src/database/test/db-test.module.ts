import {Module} from '@nestjs/common';
import {testDbProvider} from './db-test.provider';

@Module({
  imports: [...testDbProvider],
  exports: [...testDbProvider],
})
export class TestDbModule {
}
