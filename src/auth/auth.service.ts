import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';
import * as argon2 from 'argon2';
import { User } from 'src/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(password);
    const createUserDto: CreateUserDto = {
      email,
      username: email.split('@')[0],
      password: hashedPassword,
    };

    await this.usersService.create(createUserDto);
    return { message: 'User successfully registered' };
  }

  async login(
    credentials: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, credentials.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async getMe(user: User): Promise<User> {
    if (!user?.email) {
      throw new Error('User email is missing');
    }
  
    let userFromDb = await this.usersService.findByEmail(user.email);
    if (!userFromDb) {
      const createUserDto: CreateUserDto = {
        email: user.email,
        username: user.email.split('@')[0],
        password: null,
      };
      userFromDb = await this.usersService.create(createUserDto);
    }
    return userFromDb;
  }

  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = { email: user.email, sub: Number(user.id) };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
  
    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { access_token: this.jwtService.sign({ email: user.email, sub: user.id }) };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
