import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user';
import { Product } from '../../products/entities/product';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type';

@Entity()
export class Transaction {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  userId: number;

  @ApiProperty()
  @ManyToOne(() => Product, product => product.transactions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty()
  @Column()
  productId: number;

  @ApiProperty()
  @Column('int')
  quantityChange: number;

  @ApiProperty({ enum: TransactionType })
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  notes?: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice?: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalValue?: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}