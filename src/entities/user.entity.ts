import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  JoinTable,
  Index,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { PaymentEntity } from './payment.entity';
import { RolesEnum, SAYPlatformRoles } from '../types/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccount } from './ethereum.account.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { TicketContentEntity } from './ticketContent.entity';
import { TicketEntity } from './ticket.entity';
import { All } from '@nestjs/common';

const Omit = <T, K extends keyof T>(
  Class: new () => T,
  keys: K[],
): new () => Omit<T, (typeof keys)[number]> => Class;

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
  role: SAYPlatformRoles;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;

  // @ManyToMany(() => TicketContentEntity, (user) => user.id, { eager: false })
  // @JoinTable()
  // ticketContentVisits?: TicketContentEntity[];
}

@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends AllUserEntity {
  @Index({ unique: true })
  @Column({ nullable: false })
  flaskId: number;

  @Column({ nullable: true })
  birthCertificateNumber?: string;

  @Column({ nullable: true })
  idCardUrl?: string;

  @Column({ nullable: true })
  generatedCode?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  cityId?: string;

  @Column({ nullable: true })
  idNumber?: string;

  @Column({ nullable: true })
  passportNumber?: string;

  @Column({ nullable: true })
  postalAddress?: string;

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

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  gender?: boolean;

  @Column({ nullable: true })
  bankAccountNumber?: string;

  @Column({ nullable: true })
  bankAccountShebaNumber?: string;

  @Column({ nullable: true })
  bankAccountCardNumber?: string;

  @Column({ nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  telegramId?: string;

  @Column({ nullable: true })
  isCoordinator?: boolean;

  @Column({ nullable: true })
  flaskNgoId?: number;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  emergencyPhoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  passportUrl?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  childCount?: number;

  @Column({ nullable: true })
  currentChildCount?: number;

  @Column({ nullable: true })
  created?: Date;

  @Column({ nullable: true })
  updated?: Date;

  @Column({ nullable: true })
  needCount?: number;

  @Column({ nullable: true })
  currentNeedCount?: number;

  @Column({ nullable: true })
  lastLoginDate?: Date;

  @Column({ nullable: true })
  isActive?: boolean;

  @Column({ nullable: true })
  isDeleted?: boolean;

  @Column({ nullable: true })
  locale?: string;

  @Column({ nullable: true })
  typeId?: number;

  @Column({ nullable: true })
  typeName?: string;

  @Column({ nullable: true })
  ngoName?: string;

  @Column({ nullable: true })
  role: SAYPlatformRoles;

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
  @Index({ unique: true })
  @Column({ nullable: false })
  flaskId: number;

  @OneToMany(() => PaymentEntity, (payment) => payment.familyMember, {
    eager: false,
  })
  payments: PaymentEntity[];

  @ManyToMany(() => TicketEntity, (ticket) => ticket.contributors, {
    eager: false,
  })
  tickets?: TicketEntity[];
}
