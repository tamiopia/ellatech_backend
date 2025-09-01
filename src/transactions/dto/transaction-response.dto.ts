import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type';

export class TransactionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  quantityChange: number;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  unitPrice?: number;

  @ApiProperty()
  totalValue?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  productName?: string;

  @ApiProperty()
  userName?: string;
}