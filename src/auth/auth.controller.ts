import { Controller, Post, Body, UseGuards, Get, Headers, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/user/users.service';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logged in' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'New access token generated' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  @Post('refresh-token')
  async refreshToken(@Headers('Authorization') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile returned' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @UseGuards(AuthGuard(["auth0", "jwt"]))
  @Get('me')
  async getProfile(@User() user: any) {
    return this.authService.getMe(user);
  }
}
