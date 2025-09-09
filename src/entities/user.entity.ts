import { Entity, Column, ManyToMany, OneToMany } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from '../entities/ethereum.account.entity';
import { TicketEntity } from './ticket.entity';
import { ContributorEntity } from './contributor.entity';
import { SignatureEntity } from './signature.entity';
import { CommentEntity } from './comment.entity';
import { CampaignEntity } from './campaign.entity';
import { CheckPointEntity } from 'src/entities/checkpoint.entity';

@Entity()
export class AllUserEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: true })
  typeId: number; // for contributors

  @OneToMany(() => EthereumAccountEntity, (account) => account.user, {
    eager: true,
  })
  wallets: EthereumAccountEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user, {
    eager: false,
  })
  comments: CommentEntity[];

  @ManyToMany(() => CampaignEntity, (c) => c.receivers)
  campaigns: CampaignEntity[];

  // for users who also contribute in building the ecosystem
  @Column({ default: false })
  isBuilder: boolean; // content creators, developers, ...

  @Column({ nullable: false })
  isContributor: boolean; // since we have two sifferent models in flask this helps to distinguish b/w flask users and social workers and avoid id conflict

  @OneToMany(() => ContributorEntity, (c) => c.user, { eager: true })
  contributions: ContributorEntity[]; // panel contributor like admin, auditor, sw, ...

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

  @Column({ default: true })
  monthlyCampaign: boolean;

  @Column({ default: true })
  newsLetterCampaign: boolean;

  @OneToMany(() => CheckPointEntity, (cp) => cp.user)
  checkpoints: CheckPointEntity[];
}
