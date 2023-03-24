import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { FlaskRolesEnum, SAYPlatformRoles } from '../types/interfaces/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from './ethereum.account.entity';
import { TicketEntity } from './ticket.entity';
import { ContributorEntity } from './contributor.entity';


@Entity()
export class AllUserEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskId: number;

  @Column({ nullable: true })
  typeId?: number; // for contributors

  @OneToOne(() => EthereumAccountEntity, (account) => account.user, { eager: true })
  @JoinColumn()
  wallet?: EthereumAccountEntity;

  @OneToOne(() => ContributorEntity, { eager: true })
  @JoinColumn()
  contributor?: ContributorEntity;

  @Column({ nullable: false })
  isContributor?: boolean;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'enum', enum: FlaskRolesEnum, nullable: true })
  role: SAYPlatformRoles;

  @Column({ nullable: false })
  roleName: string;

  @Column({ nullable: true })
  created?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;

  @ManyToMany(() => TicketEntity, (ticket) => ticket.contributors, {
    eager: false,
  })
  tickets?: TicketEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.familyMember, {
    eager: false,
  })
  payments: PaymentEntity[];


}