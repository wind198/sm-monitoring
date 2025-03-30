import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from 'libs/constants/src/envs';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '5m' },
      verifyOptions: {
        ignoreExpiration: false,
      },
    }),
  ],
})
export class AuthModule {}
