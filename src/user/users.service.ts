import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerWithAuth0(email: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (!existingUser) {
      const newUser = this.userRepository.create({ email });
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`Created user from Auth0: ${savedUser.email}`);
      return savedUser;
    }
    return existingUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, select: ['id', 'username', 'email', 'createdAt', 'updatedAt'], });
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<{ users: User[]; total: number; page: number; pageSize: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { users, total, page, pageSize };
  }
  
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, select: ['id', 'username', 'email', 'createdAt', 'updatedAt'], });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'createdAt', 'updatedAt'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, email, username } = createUserDto;

    const user = this.userRepository.create({
      email,
      username,
      password: password,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Created user: ${savedUser.email}`);
    return savedUser;
  }

  async update(currentUserId: number, updateUserDto: UpdateUserDto): Promise<User> {
    console.log('Current user ID:', currentUserId);
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUserId !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      user.password = await argon2.hash(updateUserDto.password);
    }

    await this.userRepository.save(user);
    return user;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);
    this.logger.log(`Deleted user: ${user.email}`);

    return { message: 'User deleted' };
  }
}
