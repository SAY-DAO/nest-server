import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { CheckPointType } from 'src/types/interfaces/checkpoint-type.enum';
import { AllUserEntity } from '../entities/user.entity';
import { BaseEntity } from './BaseEntity';
import { IsOptional, IsUrl } from 'class-validator';

@Entity({ name: 'checkpoint' })
export class CheckPointEntity extends BaseEntity {
  @Column({ type: 'json', nullable: false })
  title: { en: string; fa: string };

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Column({ type: 'json', nullable: true })
  description?: { en?: string; fa?: string };

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

  @Column({ type: 'timestamptz', nullable: false, default: new Date() })
  checkPointDate: Date | null; // when the task was completed
}
