import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChildrenEntity } from './children.entity';
import { StepEntity } from './step.entity';

@Entity()
export class MileStoneEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  signature: string;

  @OneToOne(() => ChildrenEntity)
  @JoinColumn()
  child: ChildrenEntity;

  @OneToMany(() => StepEntity, (step) => step.mileStone, { eager: true })
  steps: StepEntity[];
}
