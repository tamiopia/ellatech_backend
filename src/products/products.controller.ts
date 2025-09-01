import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustProductDto } from './dto/adjust-product.dto';
import { Product } from './entities/product';
import { ProductStatusDto } from './dto/product-status.dto';
import { UserRole } from '../users/enums/user-role';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard ,RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: Product })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.id, req.user.role);
  }

  @Post('adjust')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust product quantity' })
  @ApiResponse({ status: 200, description: 'Quantity adjusted successfully', type: Product })
  @ApiResponse({ status: 400, description: 'Invalid quantity change' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid permissions' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async adjustQuantity(@Body() adjustProductDto: AdjustProductDto, @Request() req) {
    return this.productsService.adjustQuantity(adjustProductDto, req.user.role);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({ status: 200, description: 'List of products', type: [Product] })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Get('status/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get product status and stock information' })
  @ApiResponse({ status: 200, description: 'Product status', type: ProductStatusDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getStatus(@Param('productId') productId: string): Promise<ProductStatusDto> {
    return this.productsService.getProductStatus(+productId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated', type: Product })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() updateData: Partial<Product>, @Request() req) {
    return this.productsService.updateProduct(+id, updateData, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (soft delete, Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.productsService.deleteProduct(+id, req.user.role);
  }

 
}