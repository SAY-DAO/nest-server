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
import { RolesEnum } from '../types/interface';


@Entity()
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index({ unique: true, })
  @Column({ nullable: true }) // when we are getting receipt users from flask. user is flaskSwId
  flaskUserId: number;

  @Index({ unique: true })
  @Column({ nullable: true })
  flaskSwId: number; // receipts ownerId, or the id of the user in flask

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => NeedEntity, need => need.participants, { eager: false })
  doneNeeds: NeedEntity[]

  @ManyToMany(() => PaymentEntity, payment => payment.user)
  payments: PaymentEntity[]

  @Column({ type: 'enum', enum: RolesEnum, nullable: true })
  role: RolesEnum

}
