import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcrypt';
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
    const { email, username, password, passwordConfirm } = registerDto;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserDto: CreateUserDto = {
      email,
      username,
      password: hashedPassword,
    };

    await this.usersService.create(createUserDto);

    return { message: 'User successfully registered' };
  }

  async login(credentials: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByEmail(credentials.email);
    if (!user) {
      console.log('❌ User not found:', credentials.email);
      throw new UnauthorizedException('Invalid credentials');
    }
  
    console.log('🔍 Found user:', user.email);
    console.log('🔑 Entered password:', credentials.password);
    console.log('🔐 Stored hash:', user.password);
  
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    return this.generateTokens(user);
  }
  

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
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
      const hashedPassword = await bcrypt.hash(user.email, 10);

      const createUserDto: CreateUserDto = {
        email: user.email,
        username: user.email.split('@')[0],
        password: hashedPassword,
      };

      userFromDb = await this.usersService.create(createUserDto);
    }
    return userFromDb;
  }

  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}
