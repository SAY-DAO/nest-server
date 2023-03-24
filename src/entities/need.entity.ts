import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { SignatureEntity } from './signature.entity';
import { ProviderEntity } from './provider.entity';
import { ChildrenEntity } from './children.entity';
import { PaymentEntity } from './payment.entity';
import { BaseEntity } from './BaseEntity';
import { CategoryEnum, NeedTypeEnum } from '../types/interfaces/interface';
import { ReceiptEntity } from './receipt.entity';
import { NgoEntity } from './ngo.entity';
import { TicketEntity } from './ticket.entity';
import { StatusEntity } from './status.entity';
import { IpfsEntity } from './ipfs.entity';
import { ContributorEntity } from './contributor.entity';

@Entity()
export class NeedEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ nullable: true })
  flaskId: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  doingDuration: number;

  @Column({ nullable: true })
  affiliateLinkUrl?: string;

  @Column({ nullable: true })
  bankTrackId?: string;

  @Column({ type: 'enum', enum: CategoryEnum, nullable: true })
  category: number;

  @Column({ type: 'timestamptz', nullable: true })
  childDeliveryDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate?: Date;

  @Column({ nullable: true })
  cost: number;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  descriptionTranslations: { en: string; fa: string };

  @Column({ nullable: true })
  details: string;

  @Column({ type: 'timestamptz', nullable: true })
  doneAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  needRetailerImg: string;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isDone: boolean;

  @Column({ nullable: true })
  isUrgent: boolean;

  @Column({ nullable: true })
  link: string;

  @Column('simple-json', { nullable: true })
  titleTranslations: { en: string; fa: string };

  @Column({ type: 'timestamptz', nullable: true })
  ngoDeliveryDate: Date;

  @Column({ nullable: true })
  paid: number;

  @Column({ nullable: true })
  purchaseCost: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'enum', enum: NeedTypeEnum, nullable: true })
  type: NeedTypeEnum;

  @Column({ nullable: true })
  unpayable?: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  unpayableFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  // @ManyToMany(() => FamilyEntity, (user) => user.doneNeeds, { eager: false })
  // participants?: FamilyEntity[];

  @Column()
  flaskChildId: number;

  @Column({ nullable: true })
  flaskNgoId: number;

  @ManyToOne(() => ChildrenEntity, (child) => child.needs, { eager: true })
  child: ChildrenEntity;

  @ManyToOne(() => ProviderEntity, (p) => p.needs, { eager: true })
  provider?: ProviderEntity;

  @ManyToOne(() => NgoEntity, (n) => n.needs, { eager: false })
  ngo: NgoEntity;

  @ManyToOne(() => ContributorEntity, (n) => n.createdNeeds, { eager: false })
  socialWorker: ContributorEntity;

  @ManyToOne(() => ContributorEntity, (n) => n.auditedNeeds, { eager: false })
  auditor: ContributorEntity;

  @ManyToOne(() => ContributorEntity, (n) => n.purchasedNeeds, { eager: false })
  purchaser: ContributorEntity;

  @OneToMany(() => TicketEntity, (t) => t.need)
  tickets?: TicketEntity[]

  @OneToMany(() => SignatureEntity, (signature) => signature.need, { eager: false })
  signatures?: SignatureEntity[];

  @OneToOne(() => IpfsEntity, (ipfs) => ipfs.need, { eager: true }) // specify inverse side as a second parameter
  ipfs: IpfsEntity

  @OneToMany(() => PaymentEntity, (payment) => payment.need, { eager: false })
  verifiedPayments?: PaymentEntity[];

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.need, { eager: true })
  receipts?: ReceiptEntity[];

  @OneToMany(() => StatusEntity, (status) => status.need, { eager: true })
  statusUpdates?: StatusEntity[];
}

