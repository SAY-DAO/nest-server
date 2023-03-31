import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { FlaskUserTypesEnum, SAYPlatformRoles } from '../types/interfaces/interface';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from './ethereum.account.entity';
import { TicketEntity } from './ticket.entity';
import { ContributorEntity } from './contributor.entity';
import { SignatureEntity } from './signature.entity';


@Entity()
export class AllUserEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskId: number;

  @Column({ nullable: true })
  typeId?: number; // for contributors

  @OneToOne(() => ContributorEntity, { eager: true })
  @JoinColumn()
  contributor?: ContributorEntity;

  @Column({ type: 'enum', enum: FlaskUserTypesEnum, nullable: true })
  role: SAYPlatformRoles;

  @OneToOne(() => EthereumAccountEntity, (account) => account.user, { eager: true })
  @JoinColumn()
  wallet?: EthereumAccountEntity;

  @Column({ nullable: false })
  isContributor?: boolean;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

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

  @OneToMany(() => SignatureEntity, (s) => s.user, {
    eager: false,
  })
  signatures: SignatureEntity[];

}