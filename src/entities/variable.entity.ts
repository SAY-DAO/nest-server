import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';

@Entity()
export class VariableEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: false })
  distanceRatio: number;

  @Column({ nullable: false })
  difficultyRatio: number;

  @Column({ nullable: false })
  contributionRatio: number;

  @Column({ nullable: false })
  needFlaskId: number;

  @ManyToOne(() => NeedEntity, (n) => n.variables, { eager: false })
  need: NeedEntity;
}
