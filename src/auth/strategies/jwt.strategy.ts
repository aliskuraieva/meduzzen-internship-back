import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
    });
  }

  async validate(payload: JwtPayload) {
    const namespace = process.env.NAMESPACE || 'https://default-namespace.com';
    const emailClaim = `${namespace}/email`;

    return {
      userId: payload.sub,
      email: payload[emailClaim],
    };
  }
}
