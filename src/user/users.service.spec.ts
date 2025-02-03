import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            create: jest.fn().mockReturnValue({
              id: 1,
              email: 'test@example.com',
              password: 'hashedpassword',
              username: 'TestUser',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: '123456',
      username: 'TestUser',
    };

    const user = { ...createUserDto, id: 1, password: 'hashedpassword' };

    jest.spyOn(repo, 'save').mockResolvedValue(user as any);

    const result = await service.create(createUserDto);

    expect(result.id).toBeDefined();
    expect(result.email).toBe(createUserDto.email);
    expect(result.username).toBe(createUserDto.username);
  });
});
