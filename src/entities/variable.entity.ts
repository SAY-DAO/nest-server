import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import {
  DecimalToString,
  DecimalTransformer,
} from '../utils/decimal.transformer';
import { Transform } from 'class-transformer';
import Decimal from 'decimal.js';

@Entity()
export class VariableEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  public distanceRatio: Decimal;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  public difficultyRatio: Decimal;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  public contributionRatio: Decimal;

  @Column({ nullable: false })
  needFlaskId: number;

  @ManyToOne(() => NeedEntity, (n) => n.variables, { eager: false })
  need: NeedEntity;
}
