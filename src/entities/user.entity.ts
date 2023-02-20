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
import { ContributorsEnum, RolesEnum } from '../types/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccount } from './ethereum.account.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { ReceiptEntity } from './receipt.entity';


@Entity()
export class AllUserEntity extends BaseEntity {
  @OneToOne(() => EthereumAccount, { eager: true })
  @JoinColumn()
  wallet?: EthereumAccount;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: true })
  isActive?: boolean;

  @Column({ type: 'enum', enum: RolesEnum, nullable: true })
  role: ContributorsEnum
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

  @Column({ nullable: true })
  birthCertificateNumber?: string;

  @Column({ nullable: true })
  idCardUrl?: string;

  @Column({ nullable: true })
  generatedCode?: string;

  @Column({ nullable: true })
  cityId?: string;

  @Column({ nullable: true })
  stateId?: string;

  @Column({ nullable: true })
  countryId?: string;

  @Column({ nullable: true })
  cityName?: string;

  @Column({ nullable: true })
  stateName?: string;

  @Column({ nullable: true })
  countryName?: string;

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker)
  children?: ChildrenEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: true })
  ngo?: NgoEntity;


}
