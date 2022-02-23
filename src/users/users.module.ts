import {forwardRef, Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {AuthModule} from '../auth/auth.module';
import {SchemasModule} from '../schemas/schemas.module';
import {HelpersModule} from '../helpers/helpers.module';
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from '../config/config.service';
import {DocumentModule} from '../document/document.module';
import {OrderModule} from "../order/order.module";
import {RiderModule} from "../rider/rider.module";
import {PharmacyModule} from "../pharmacy/pharmacy.module";
import {ProductModule} from "../product/product.module";
import {AdminModule} from "../admin/admin.module";
import {AdminChatModule} from "../admin-chat/admin-chat.module";

@Module({
  imports: [
    SchemasModule,
    forwardRef(() => AuthModule),
    forwardRef(() => HelpersModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => OrderModule),
    forwardRef(() => RiderModule),
    forwardRef(() => PharmacyModule),
    forwardRef(() => ProductModule),
    forwardRef(() => AdminModule),
    forwardRef(() => AdminChatModule),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {expiresIn: '60d'},
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {
}
