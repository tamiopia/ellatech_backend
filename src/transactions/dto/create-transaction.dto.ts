import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsIn, IsOptional, IsPositive, IsNumber } from 'class-validator';
import { TransactionType } from '../enums/transaction-type';

export class CreateTransactionDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  quantityChange: number;

  @ApiProperty({ enum: TransactionType, enumName: 'TransactionType' })
  @IsIn(Object.values(TransactionType))
  type: TransactionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;
}