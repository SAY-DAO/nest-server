import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NeedEntity } from './need.entity';
import { SignatureEnum } from '../types/interface';

@Entity()
export class SignatureEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column()
  signer: string;

  @Column()
  hash: string;

  @Column({ type: 'enum', enum: SignatureEnum, nullable: true })
  role: SignatureEnum;

  @ManyToOne(() => NeedEntity, (need) => need.signatures, { eager: false })
  need: NeedEntity;

}
