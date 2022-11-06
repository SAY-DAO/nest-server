import {
  Entity,
  Column,
  Index,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { PaymentEntity } from './payment.entity';
import { RolesEnum } from '../types/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccount } from './ethereum.account.entity';


@Entity()
export class AllUserEntity extends BaseEntity {
  @OneToOne(() => EthereumAccount, { eager: true })
  @JoinColumn()
  wallet: EthereumAccount;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: RolesEnum, nullable: true })
  role: RolesEnum
}

@Entity()
export class FamilyEntity extends AllUserEntity {
  @Index({ unique: true })
  @Column({ nullable: true })
  flaskUserId: number;

  @ManyToMany(() => NeedEntity, need => need.participants, { eager: false })
  doneNeeds: NeedEntity[]

  @ManyToMany(() => PaymentEntity, payment => payment.user)
  payments: PaymentEntity[]
}

@Entity()
export class SocialWorkerEntity extends AllUserEntity {
  @Index({ unique: true, })
  @Column({ nullable: true })
  flaskSwId: number;

  @OneToMany(() => NeedEntity, (need) => need.createdById)
  createdNeeds: NeedEntity[];
}
