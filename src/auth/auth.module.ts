import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/user/users.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key',
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, Auth0Strategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
