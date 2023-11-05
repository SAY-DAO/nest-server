import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from '../entities/ethereum.account.entity';
import { TicketEntity } from './ticket.entity';
import { ContributorEntity } from './contributor.entity';
import { SignatureEntity } from './signature.entity';
import { CommentEntity } from './comment.entity';
import { CampaignEntity } from './campaign.entity';

@Entity()
export class AllUserEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: true })
  typeId: number; // for contributors

  @OneToMany(() => ContributorEntity, (c) => c.user, { eager: true })
  contributions: ContributorEntity[];

  @OneToMany(() => EthereumAccountEntity, (account) => account.user, {
    eager: true,
  })
  wallets: EthereumAccountEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user, {
    eager: false,
  })
  comments: CommentEntity[];

  @ManyToMany(() => CampaignEntity, (c) => c.contentNeeds)
  campaigns: CampaignEntity[];

  @Column({ nullable: false })
  isContributor: boolean;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @ManyToMany(() => TicketEntity, (ticket) => ticket.contributors, {
    eager: false,
  })
  tickets: TicketEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.familyMember, {
    eager: false,
  })
  payments: PaymentEntity[];

  @OneToMany(() => SignatureEntity, (s) => s.user, {
    eager: false,
  })
  signatures: SignatureEntity[];

  @Column({ default: false })
  monthlyEmail: boolean;

  @OneToMany(() => CampaignEntity, (e) => e.receivers, {
    eager: false,
  })
  receivedEmails: CampaignEntity[];
}
