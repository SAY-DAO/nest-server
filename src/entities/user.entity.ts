import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { PaymentEntity } from './payment.entity';
import { RolesEnum, SAYPlatformRoles } from '../types/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccount } from './ethereum.account.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { TicketEntity } from './ticket.entity';


@Entity()
export class AllUserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ nullable: false })
  flaskId: number;

  @OneToOne(() => EthereumAccount, { eager: true })
  @JoinColumn()
  wallet?: EthereumAccount;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'enum', enum: RolesEnum, nullable: true })
  role: SAYPlatformRoles;

  @Column({ nullable: true })
  created?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;
}

@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends AllUserEntity {
  @Column({ nullable: true })
  flaskNgoId?: number;

  @Column({ nullable: true })
  typeId?: number;

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker)
  children?: ChildrenEntity[];

  @OneToMany(() => NeedEntity, (c) => c.socialWorker)
  createdNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.auditor)
  auditedNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.purchaser)
  purchasedNeeds?: NeedEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: true })
  ngo?: NgoEntity;

  @ManyToMany(() => TicketEntity, (ticket) => ticket.contributors, {
    eager: false,
  })
  tickets?: TicketEntity[];
}

@Entity()
export class FamilyEntity extends AllUserEntity {
  @OneToMany(() => PaymentEntity, (payment) => payment.familyMember, {
    eager: false,
  })
  payments: PaymentEntity[];

  @ManyToMany(() => TicketEntity, (ticket) => ticket.contributors, {
    eager: false,
  })
  tickets?: TicketEntity[];
}


