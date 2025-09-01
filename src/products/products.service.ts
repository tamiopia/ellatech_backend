import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustProductDto } from './dto/adjust-product.dto';
import { ProductStatusDto } from './dto/product-status.dto';
import { UserRole } from '../users/enums/user-role';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number, userRole: UserRole): Promise<Product> {
    // Only admins can create products
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can create products');
    }

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async adjustQuantity(adjustProductDto: AdjustProductDto, userRole: UserRole): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: adjustProductDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product is active
    if (!product.isActive) {
      throw new BadRequestException('Cannot adjust quantity of inactive product');
    }

    // Validate quantity change based on user role
    if (userRole === UserRole.USER && adjustProductDto.quantityChange > 0) {
      throw new ForbiddenException('Users can only purchase products (negative quantity change)');
    }

    if (product.quantity + adjustProductDto.quantityChange < 0) {
      throw new BadRequestException('Insufficient quantity');
    }

    product.quantity += adjustProductDto.quantityChange;
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

 

  async updateProduct(id: number, updateData: Partial<Product>, userRole: UserRole): Promise<Product> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update products');
    }

    const product = await this.findOne(id);
    Object.assign(product, updateData);
    return this.productsRepository.save(product);
  }

  async deleteProduct(id: number, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete products');
    }

    const product = await this.findOne(id);
    product.isActive = false; // Soft delete
    await this.productsRepository.save(product);
  }

  async getProductStatus(productId: number): Promise<ProductStatusDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['transactions'],
    });
  
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  
    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    
    if (product.quantity === 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (product.quantity <= product.minStockLevel) {
      stockStatus = 'LOW_STOCK';
    }
  
    // Get last transaction date
    const lastTransaction = product.transactions
      ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  
    return {
      productId: product.id,
      name: product.name,
      currentQuantity: product.quantity,
      minStockLevel: product.minStockLevel,
      stockStatus,
      lastTransactionDate: lastTransaction?.createdAt,
      isActive: product.isActive,
    };
  }

  async updateProductQuantity(productId: number, newQuantity: number): Promise<void> {
    await this.productsRepository.update(productId, { 
      quantity: newQuantity,
      updatedAt: new Date()
    });
  }
}