import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Query, UseGuards,Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid permissions' })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  async create(@Body() createTransactionDto: CreateTransactionDto, @Request() req): Promise<TransactionResponseDto> {
    
    return this.transactionsService.create(
      createTransactionDto, 
      req.user.id, 
      req.user.role
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all transactions with pagination and filtering(Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'List of transactions', type: [TransactionResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: number,
    @Query('productId') productId?: number,
    @Query('type') type?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.transactionsService.findAll(page, limit, userId, productId, type, startDate, endDate);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transactions for a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User transactions', type: [TransactionResponseDto] })
  async getUserTransactions(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.transactionsService.getUserTransactions(+userId, page, limit);
  }

  @Get('product/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transactions for a specific product' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Product transactions', type: [TransactionResponseDto] })
  async getProductTransactions(
    @Param('productId') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.transactionsService.getProductTransactions(+productId, page, limit);
  }

  @Get('summary/overview')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction summary overview (Admin only)' })
  @ApiResponse({ status: 200, description: 'Transaction summary' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getTransactionSummary() {
    return this.transactionsService.getTransactionSummary();
  }

  
  @Get('me/my-transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my own transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by transaction type' })
  @ApiQuery({ name: 'startDate', required: false, type: Date, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, type: Date, description: 'Filter by end date' })
  @ApiResponse({ status: 200, description: 'List of user\'s transactions', type: [TransactionResponseDto] })
  async getMyTransactions(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.transactionsService.getMyTransactions(
      req.user.id, 
      page, 
      limit, 
      type,
      startDate,
      endDate
    );
  }
}