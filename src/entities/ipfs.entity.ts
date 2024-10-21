import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { NeedEntity } from './need.entity';
import { BaseEntity } from './BaseEntity';

@Entity()
export class IpfsEntity extends BaseEntity {
  @Column()
  flaskNeedId: number;

  @Column({ nullable: false })
  needDetailsHash: string;

  @Column({ nullable: true })
  receiptsHash: string;

  @Column({ nullable: true })
  paymentsHash: string;

  @OneToOne(() => NeedEntity, (need) => need.ipfs, {
    eager: false,
    nullable: false,
  })
  @JoinColumn()
  need: NeedEntity;
}
