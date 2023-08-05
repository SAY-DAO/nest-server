import { Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';

export class MidjourneyEntity extends BaseEntity {
  @Column()
  flaskNeedId: number;

  @Column({ nullable: false })
  needDetailsHash: string;

  @Column({ nullable: true })
  receiptsHash: string;

  @Column({ nullable: true })
  paymentsHash: string;

  @OneToOne(() => NeedEntity)
  @JoinColumn()
  need: NeedEntity;
}
