import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user';
import { UserRole } from './enums/user-role';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('users')
@Roles(UserRole.ADMIN)
@Controller('users')
@UseGuards(JwtAuthGuard,RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
 @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id/promote-to-admin')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promote user to admin (Admin only)' })
  @ApiResponse({ status: 200, description: 'User promoted to admin', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async promoteToAdmin(@Param('id') id: string): Promise<User> {
    return this.usersService.promoteToAdmin(+id);
  }

  @Patch(':id/demote-to-user')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demote admin to user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User demoted to regular user', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async demoteToUser(@Param('id') id: string): Promise<User> {
    return this.usersService.demoteToUser(+id);
  }
}