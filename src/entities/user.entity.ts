import {
  Entity,
  Column,
  Index,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { PaymentEntity } from './payment.entity';
import { RolesEnum } from '../types/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccount } from './ethereum.account.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { ReceiptEntity } from './receipt.entity';


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
  @JoinTable()
  doneNeeds: NeedEntity[]

  @OneToMany(() => PaymentEntity, payment => payment.user, { eager: false })
  payments: PaymentEntity[]
}

@Entity()
export class SocialWorkerEntity extends AllUserEntity {
  @Index({ unique: true, })
  @Column({ nullable: true })
  flaskSwId: number;

  @OneToMany(() => NeedEntity, (n) => n.socialWorker, { eager: false })
  createdNeeds: NeedEntity[];

  @OneToMany(() => NeedEntity, (n) => n.supervisor, { eager: false })
  confirmedNeeds: NeedEntity[];

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker)
  children: ChildrenEntity[];

  @OneToMany(() => ChildrenEntity, (c) => c.supervisor)
  confirmedChildren: ChildrenEntity[];

  @OneToMany(() => ReceiptEntity, (r) => r.socialWorker, { eager: false })
  receipts: ReceiptEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: true })
  ngo: NgoEntity;

}
