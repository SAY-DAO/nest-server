import { Entity, Column, Index, OneToMany, ManyToOne, OneToOne } from 'typeorm';
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
import { AllUserEntity } from './user.entity';
import { SignatureEntity } from './signature.entity';
import { CommentEntity } from './comment.entity';
import { VariableEntity } from './variable.entity';
import { EthereumTransaction } from './ethereum.transaction.entity';

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

  @Column('simple-json', { nullable: true })
  descriptionTranslations: { en: string; fa: string };

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  information: string;

  @Column({ type: 'timestamptz', nullable: true })
  doneAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  needRetailerImg: string;

  @Column({ nullable: true })
  midjourneyImage: string;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isUrgent: boolean;

  @Column({ nullable: true })
  link: string;

  @Column('simple-json', { nullable: true })
  nameTranslations: { en: string; fa: string };

  @Column({ type: 'timestamptz', nullable: true })
  ngoDeliveryDate: Date;

  @Column({ nullable: true })
  purchaseCost: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  deliveryCode: string;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'enum', enum: NeedTypeEnum, nullable: true })
  type: NeedTypeEnum;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unavailableFrom: Date;

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

  @ManyToOne(() => AllUserEntity, { eager: true })
  socialWorker: AllUserEntity;

  @ManyToOne(() => AllUserEntity, { eager: true })
  auditor: AllUserEntity;

  @ManyToOne(() => AllUserEntity, { eager: true })
  purchaser: AllUserEntity;

  @OneToMany(() => TicketEntity, (t) => t.need)
  tickets?: TicketEntity[];

  @OneToMany(() => CommentEntity, (t) => t.need)
  comments?: CommentEntity[];

  @Column({ default: true }) // only for family comment/report usage
  isResolved: boolean;

  @Column({ default: false })
  isMined: boolean;

  @OneToMany(() => SignatureEntity, (s) => s.need, { eager: true })
  signatures?: SignatureEntity[];

  @OneToOne(() => IpfsEntity, (ipfs) => ipfs.need, { eager: true }) // specify inverse side as a second parameter
  ipfs: IpfsEntity;

  @OneToMany(() => PaymentEntity, (payment) => payment.need, { eager: false })
  verifiedPayments?: PaymentEntity[];

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.need, { eager: false })
  receipts?: ReceiptEntity[];

  @OneToMany(() => StatusEntity, (status) => status.need, { eager: false })
  statusUpdates?: StatusEntity[];

  @OneToMany(() => EthereumTransaction, (t) => t.need, { eager: true })
  ethereumTransactions?: EthereumTransaction[];

  @OneToMany(() => VariableEntity, (v) => v.need, { eager: true })
  variables?: VariableEntity[];
}
