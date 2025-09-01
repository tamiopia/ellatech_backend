import { Injectable, ConflictException, ForbiddenException ,NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './enums/user-role';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER, // Default to USER if not provided
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = UserRole.ADMIN;
    return this.usersRepository.save(user);
  }

  async demoteToUser(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = UserRole.USER;
    return this.usersRepository.save(user);
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.findOne(userId);
    return user?.role === UserRole.ADMIN;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}