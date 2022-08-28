import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SignatureEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  signature: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
