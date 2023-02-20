import {
  Entity,
  Column,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  ManyToOne,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SocialWorkerEntity, FamilyEntity } from './user.entity';
import { SignatureEntity } from './signature.entity';
import { ProviderEntity } from './provider.entity';
import { ChildrenEntity } from './children.entity';
import { PaymentEntity } from './payment.entity';
import { BaseEntity } from './BaseEntity';
import { CategoryEnum, NeedTypeEnum } from '../types/interface';
import { ReceiptEntity } from './receipt.entity';
import { NgoEntity } from './ngo.entity';

@Entity()
export class NeedEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Index({ unique: true })
  @Column()
  flaskNeedId: number;

  @Column({ nullable: true })
  title: string;

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

  @ManyToMany(() => FamilyEntity, (user) => user.doneNeeds, { eager: false })
  @JoinTable()
  participants?: FamilyEntity[];

  @OneToMany(() => SignatureEntity, (signature) => signature.need, { eager: true })
  signatures?: SignatureEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.need, { eager: false })
  payments?: PaymentEntity[];

  @OneToMany(() => ReceiptEntity, (receipt) => receipt.need, { eager: true })
  receipts?: ReceiptEntity[];

  @Column()
  flaskChildId: number;

  @Column({ nullable: true })
  flaskNgoId: number;

  @ManyToOne(() => ChildrenEntity, (child) => child.needs, { eager: false })
  child: ChildrenEntity;

  @ManyToOne(() => ProviderEntity, (p) => p.needs, { eager: true })
  provider?: ProviderEntity;

  @ManyToOne(() => NgoEntity, (n) => n.needs, { eager: false })
  ngo: NgoEntity;

  @OneToOne(() => SocialWorkerEntity)
  @JoinColumn()
  socialWorker: SocialWorkerEntity;
}

