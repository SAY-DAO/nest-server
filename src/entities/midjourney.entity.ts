import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';

@Entity()
export class MidjourneyEntity extends BaseEntity {
  @Index({ unique: true })
  @Column()
  flaskNeedId: number;

  @Column()
  fileName: string;

  @OneToOne(() => NeedEntity)
  @JoinColumn()
  need: NeedEntity;
}
