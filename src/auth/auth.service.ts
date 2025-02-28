import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from 'src/user/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      username: registerDto.email.split('@')[0],
      password: hashedPassword,
    };
    
    const newUser = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user || !(await argon2.verify(user.password, loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return { accessToken: this.jwtService.sign({ sub: user.id, email: user.email }) };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(user: User): Promise<Omit<User, 'password'>> {
    if (!user?.email) {
      throw new UnauthorizedException('User email is missing');
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
  
    const { password, ...userWithoutPassword } = userFromDb;
    return userWithoutPassword;
  }
}
