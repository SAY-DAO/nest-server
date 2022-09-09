import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MileStoneEntity } from './milestone.entity';
import { NeedEntity } from './need.entity';

@Entity()
export class StepEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => NeedEntity)
  @JoinColumn()
  need: NeedEntity;

  @ManyToOne(() => MileStoneEntity, (ms) => ms.steps)
  mileStone: MileStoneEntity;
}
