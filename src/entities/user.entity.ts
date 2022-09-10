import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NeedEntity } from './need.entity';
import { PaymentEntity } from './payment.entity';

@Entity()
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index({ unique: true })
  @Column()
  userId: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => NeedEntity, need => need.participants)
  doneNeeds: NeedEntity[]

  @ManyToMany(() => PaymentEntity, payment => payment.user)
  payments: PaymentEntity[]
}
