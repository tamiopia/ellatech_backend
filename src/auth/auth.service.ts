import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    
    
    const user = await this.usersService.findByEmail(email);
    
    
    if (user) {
      
      if (!password || !user.password) {
       
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        const { password: _, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any): Promise<TokenResponseDto> {
    console.log('Login attempt:', user.email); // Debug log
  
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
  
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  

  async register(createUserDto: CreateUserDto): Promise<TokenResponseDto> {
    console.log('Registering user:', createUserDto.email); // Debug log
    
    const user = await this.usersService.create(createUserDto);
    const { password: _, ...userWithoutPassword } = user;

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };

    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}