import { Injectable, UnauthorizedException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(credentials: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByUsername(credentials.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(user: User): Promise<User> {
    let userFromDb = await this.usersService.findByEmail(user.email);
    if (!userFromDb) {
      const password = null;
    
      const createUserDto: CreateUserDto = {
        email: user.email,
        username: user.email.split('@')[0],
        password,
      };

      userFromDb = await this.usersService.create(createUserDto);
    }
    return userFromDb;
  }

  private generateTokens(user: User): { access_token: string; refresh_token: string } {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' });

    return { access_token, refresh_token };
  }
}
