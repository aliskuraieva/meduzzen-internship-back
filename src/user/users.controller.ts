import { 
  Controller, Get, Post, Body, Param, Put, Delete, Query, BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { HttpStatus } from '@nestjs/common';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of users per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users list retrieved successfully' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination.page, pagination.pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    if ('email' in updateUserDto) {
      throw new BadRequestException('Email cannot be updated');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
