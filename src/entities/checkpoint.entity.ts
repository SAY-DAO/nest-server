import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  RelationId,
  JoinColumn,
  Index,
} from 'typeorm';
import { CheckPointType } from 'src/types/interfaces/checkpoint-type.enum';
import { AllUserEntity } from '../entities/user.entity';
import { BaseEntity } from './BaseEntity';

@Entity({ name: 'checkpoint' })
export class CheckPointEntity extends BaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CheckPointType,
    nullable: false,
    default: CheckPointType.FEATURE,
  })
  type: CheckPointType;

  @ManyToOne(() => AllUserEntity, (user) => user.checkpoints, {
    onDelete: 'CASCADE',
  })
  user: AllUserEntity;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt?: Date | null;

  @RelationId((cp: CheckPointEntity) => cp.user)
  userId: string;
}
