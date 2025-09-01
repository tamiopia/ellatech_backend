import { Injectable, NotFoundException,BadRequestException,ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role';
import { TransactionType } from './enums/transaction-type';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number, userRole: UserRole): Promise<TransactionResponseDto> {
    
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const product = await this.productsService.findOne(createTransactionDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    
    if (!product.isActive && 
        createTransactionDto.type !== TransactionType.RETURN &&
        createTransactionDto.type !== TransactionType.DAMAGED) {
      throw new BadRequestException('Cannot transact with inactive product');
    }
  
    
    if (userRole === UserRole.USER) {
      if (createTransactionDto.type !== TransactionType.PURCHASE) {
        throw new ForbiddenException('Users can only make purchase transactions');
      }
      if (createTransactionDto.quantityChange > 0) {
        throw new ForbiddenException('Users can only purchase products (negative quantity change)');
      }
    }
  
    this.validateTransactionType(createTransactionDto.type, createTransactionDto.quantityChange);
  
    const unitPrice = createTransactionDto.unitPrice || parseFloat(product.price.toString());
    
    const totalValue = unitPrice * Math.abs(createTransactionDto.quantityChange);
  
    await this.updateProductQuantity(product, createTransactionDto.quantityChange, createTransactionDto.type);
  
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId, 
      unitPrice,
      totalValue,
    });
  
    const savedTransaction = await this.transactionsRepository.save(transaction);
  
    return {
      id: savedTransaction.id,
      userId: savedTransaction.userId,
      productId: savedTransaction.productId,
      quantityChange: savedTransaction.quantityChange,
      type: savedTransaction.type,
      notes: savedTransaction.notes,
      unitPrice: savedTransaction.unitPrice,
      totalValue: savedTransaction.totalValue,
      createdAt: savedTransaction.createdAt,
      productName: product.name,
      userName: user.name,
    };
  }
  
  private async updateProductQuantity(product: any, quantityChange: number, type: TransactionType): Promise<void> {
    // For certain transaction types, we might not want to update inventory
    const shouldUpdateInventory = ![
      TransactionType.HOLD,
      TransactionType.SAMPLE,
      TransactionType.CYCLE_COUNT
    ].includes(type);
  
    if (!shouldUpdateInventory) {
      return;
    }
  
    
    const newQuantity = product.quantity + quantityChange;
  
    
    if (newQuantity < 0 && 
        type !== TransactionType.RETURN && 
        type !== TransactionType.DAMAGED &&
        type !== TransactionType.EXPIRED) {
      throw new BadRequestException('Insufficient quantity available');
    }
  
    
    product.quantity = newQuantity;
    await this.productsService.updateProductQuantity(product.id, newQuantity);
  }
  
  private validateTransactionType(type: TransactionType, quantityChange: number): void {
    switch (type) {
      case TransactionType.PURCHASE:
      case TransactionType.RETURN:
      case TransactionType.DAMAGED:
      case TransactionType.EXPIRED:
      case TransactionType.TRANSFER_OUT:
      case TransactionType.LOST:
        
        if (quantityChange > 0) {
          throw new BadRequestException(`Transaction type ${type} typically requires negative quantity change`);
        }
        break;
      
      case TransactionType.RESTOCK:
      case TransactionType.ADJUSTMENT:
      case TransactionType.TRANSFER_IN:
      case TransactionType.FOUND:
      case TransactionType.RELEASE:
        // These typically increase inventory (positive quantity change)
        if (quantityChange < 0) {
          throw new BadRequestException(`Transaction type ${type} typically requires positive quantity change`);
        }
        break;
      
      case TransactionType.HOLD:
      case TransactionType.SAMPLE:
      case TransactionType.CYCLE_COUNT:
        // These can have either positive or negative changes
        break;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: number,
    productId?: number,
    type?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    }

    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const transactionDtos = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      productId: transaction.productId,
      quantityChange: transaction.quantityChange,
      type: transaction.type,
      notes: transaction.notes,
      unitPrice: transaction.unitPrice,
      totalValue: transaction.totalValue,
      createdAt: transaction.createdAt,
      productName: transaction.product?.name,
      userName: transaction.user?.name,
    }));

    return { transactions: transactionDtos, total };
  }

  async findOne(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      id: transaction.id,
      userId: transaction.userId,
      productId: transaction.productId,
      quantityChange: transaction.quantityChange,
      type: transaction.type,
      notes: transaction.notes,
      unitPrice: transaction.unitPrice,
      totalValue: transaction.totalValue,
      createdAt: transaction.createdAt,
      productName: transaction.product?.name,
      userName: transaction.user?.name,
    };
  }

  async getUserTransactions(userId: number, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, userId);
  }

  async getProductTransactions(productId: number, page: number = 1, limit: number = 10) {
    return this.findAll(page, limit, undefined, productId);
  }

  async getTransactionSummary() {
    const totalTransactions = await this.transactionsRepository.count();
    const totalValue = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.totalValue)', 'total')
      .getRawOne();

    const recentTransactions = await this.transactionsRepository.find({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalTransactions,
      totalValue: parseFloat(totalValue.total) || 0,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        quantityChange: t.quantityChange,
        productName: t.product?.name,
        userName: t.user?.name,
        createdAt: t.createdAt,
      })),
    };
  }
  async getMyTransactions(
    userId: number, 
    page: number = 1, 
    limit: number = 10,
    type?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ transactions: TransactionResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    if (type) where.type = type;
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    }
  
    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  
    const transactionDtos = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      productId: transaction.productId,
      quantityChange: transaction.quantityChange,
      type: transaction.type,
      notes: transaction.notes,
      unitPrice: transaction.unitPrice,
      totalValue: transaction.totalValue,
      createdAt: transaction.createdAt,
      productName: transaction.product?.name,
      userName: transaction.user?.name,
    }));
  
    return { transactions: transactionDtos, total };
  }
}