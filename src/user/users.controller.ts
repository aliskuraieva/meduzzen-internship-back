import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { HttpStatus } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of users' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of users per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users list retrieved successfully',
  })
  @UseGuards(AuthGuard(['auth0', 'jwt']))
  async findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.page, pagination.pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @UseGuards(AuthGuard(['auth0', 'jwt']))
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @UseGuards(AuthGuard(['auth0', 'jwt']))
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put('me')
  @UseGuards(AuthGuard(['auth0', 'jwt']))
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  async update(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {

    return this.usersService.update(user.email, updateUserDto);
  }

  @Delete('me')
  @UseGuards(AuthGuard(['auth0', 'jwt']))
  @ApiOperation({ summary: 'Delete current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  async remove(@CurrentUser() user: User) {
    return this.usersService.remove(user.id);
  }
}
