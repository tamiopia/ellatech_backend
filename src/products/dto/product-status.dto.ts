import { ApiProperty } from '@nestjs/swagger';

export class ProductStatusDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  currentQuantity: number;

  @ApiProperty()
  minStockLevel: number;

  @ApiProperty()
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

  @ApiProperty()
  lastTransactionDate?: Date;

  @ApiProperty()
  isActive: boolean;
}