import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from './ethereum.account.entity';
import { TicketEntity } from './ticket.entity';
import { ContributorEntity } from './contributor.entity';
import { SignatureEntity } from './signature.entity';

@Entity()
export class AllUserEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: true })
  typeId?: number; // for contributors

  @OneToMany(() => ContributorEntity, (c) => c.user, { eager: true })
  contributions?: ContributorEntity[];

  @OneToMany(() => EthereumAccountEntity, (account) => account.user, {
    eager: true,
  })
  wallets?: EthereumAccountEntity[];

  @Column({ nullable: false })
  isContributor?: boolean;

  @Column({ nullable: true })
  userName?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

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
