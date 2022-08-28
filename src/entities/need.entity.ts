import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class NeedEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  need_id: number;

  @Column()
  title: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
