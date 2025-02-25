import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(page = 1, pageSize = 10): Promise<{ users: User[]; total: number; page: number; pageSize: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { users, total, page, pageSize };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);
    this.logger.log(`Deleted user: ${user.email}`);

    return { message: 'User deleted' };
  }
}
