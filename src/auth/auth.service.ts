import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async registerWithAuth0(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      const newUserDto = {
        email,
        username: email.split('@')[0],
        password: 'default_password',
      };
      const newUser = await this.usersService.create(newUserDto);
      this.logger.log(`Created user from Auth0: ${newUser.email}`);
      return newUser;
    }
    this.logger.log(`User already exists: ${user.email}`);
    return user;
  }

  async login(credentials: LoginDto): Promise<{ access_token: string }> {

    const user = await this.usersService.findByUsername(credentials.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`User logged in: ${user.email}`);
    return { access_token: accessToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return {
        accessToken: this.jwtService.sign({ sub: payload.sub, email: payload.email }, { expiresIn: '15m' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

