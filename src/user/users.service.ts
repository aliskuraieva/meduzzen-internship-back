import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpStatusEnum } from '../common/enums/http-status.enum';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, pageSize = 10): Promise<ResponseDto<{ users: User[]; total: number; page: number; pageSize: number }>> {
    const [users, total] = await this.userRepository.findAndCount({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  
    return {
      status_code: HttpStatusEnum.OK,
      detail: { users, total, page, pageSize },
      result: 'working',
    };
  }
  
  async findOne(id: number): Promise<ResponseDto<{ user: User }>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  
    return {
      status_code: HttpStatusEnum.OK,
      detail: { user },
      result: 'working',
    };
  }
  
  async create(createUserDto: CreateUserDto): Promise<ResponseDto<{ user: User }>> {
    const { password, email, username } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });
  
    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Created user: ${savedUser.email}`);
  
    return {
      status_code: HttpStatusEnum.CREATED,
      detail: { user: savedUser },
      result: 'user created',
    };
  }
  
  async update(id: number, updateUserDto: UpdateUserDto): Promise<ResponseDto<{ user: User }>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
  
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
  
    this.logger.log(`Updated user: ${updatedUser.email}`);
    return {
      status_code: HttpStatusEnum.OK,
      detail: { user: updatedUser },
      result: 'user updated',
    };
  }
  
  async remove(id: number): Promise<ResponseDto<{ message: string }>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  
    await this.userRepository.remove(user);
    this.logger.log(`Deleted user: ${user.email}`);
  
    return {
      status_code: HttpStatusEnum.OK,
      detail: { message: 'User deleted' },
      result: 'working',
    };
  }
}
