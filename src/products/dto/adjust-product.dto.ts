import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsIn, Min, Max, IsOptional } from 'class-validator';

export class AdjustProductDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsInt()
  quantityChange: number;

  @ApiProperty()
  @IsString()
  @IsIn(['purchase', 'restock', 'adjustment', 'return'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}