import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategyProvider } from '~/strategies/google.strategy/google.strategy';
import { GlobalModule } from '~/modules/global/global.module';
import { UsersService } from '~/services/users/users.service';
import { AuthController } from '~/controllers/auth/auth.controller';
import { MetasModule } from '~/modules/metas/metas.module';
import { OidcStrategyProvider } from '~/strategies/oidc.strategy/oidc.strategy';

@Module({
  imports: [
    forwardRef(() => GlobalModule),
    PassportModule,
    forwardRef(() => MetasModule),
  ],
  controllers: [
    ...(process.env.NC_WORKER_CONTAINER !== 'true' ? [AuthController] : []),
  ],
  providers: [UsersService, GoogleStrategyProvider, OidcStrategyProvider],
  exports: [UsersService],
})
export class AuthModule { }
