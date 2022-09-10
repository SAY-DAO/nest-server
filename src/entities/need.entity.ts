import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { SignatureEntity } from './signature.entity';
import { ProviderEntity } from './provider.entity';
import { ChildrenEntity } from './children.entity';
import { PaymentEntity } from './payment.entity';

@Entity()
export class NeedEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Index({ unique: true })
  @Column()
  needId: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  doingDuration: number;

  @Column({ nullable: true })
  affiliateLinkUrl?: string;

  @Column({ nullable: true })
  bankTrackId?: string;

  @Column({ nullable: true })
  category: number;

  @Column({ nullable: true })
  childGeneratedCode: string;

  @Column({ nullable: true })
  childSayName: string;

  @Column({ type: 'timestamptz', nullable: true })
  childDeliveryDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate?: Date;

  @Column({ nullable: true })
  confirmUser?: number;

  @Column({ nullable: true })
  cost: number;


  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ nullable: true })
  createdById?: number;

  @Column({ nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  descriptionTranslations: { en: string; fa: string };

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  doing_duration: number;

  @Column({ nullable: true })
  donated: number;

  @Column({ type: 'timestamptz', nullable: true })
  doneAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  needRetailerImg: string;

  @Column({ nullable: true })
  informations: string;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isDone: boolean;

  @Column({ nullable: true })
  isReported: boolean;

  @Column({ nullable: true })
  isUrgent: boolean;

  @Column({ nullable: true })
  link: string;

  @Column('simple-json', { nullable: true })
  titleTranslations: { en: string; fa: string };

  @Column({ nullable: true })
  ngoAddress: string;

  @Column({ nullable: true })
  ngoId: number;

  @Column({ nullable: true })
  ngoName: string;

  @Column({ type: 'timestamptz', nullable: true })
  ngoDeliveryDate: Date;

  @Column({ nullable: true })
  oncePurchased: boolean;

  @Column({ nullable: true })
  paid: number;

  @Column({ nullable: true })
  progress: string;

  @Column({ nullable: true })
  purchaseCost: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  receiptCount?: number;

  @Column({ nullable: true })
  receipts?: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  statusDescription?: string;

  @Column({ type: 'timestamptz', nullable: true })
  statusUpdatedAt?: Date;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  typeName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  unavailableFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unconfirmedAt?: Date;

  @Column({ nullable: true })
  unpaidCost?: number;

  @Column({ nullable: true })
  unpayable?: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  unpayableFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @ManyToMany(() => UserEntity, (user) => user.doneNeeds, {
    eager: true, // eg: need.participants is forced to be included
  })
  @JoinTable()
  participants?: UserEntity[];

  @OneToMany(() => SignatureEntity, (signature) => signature.need, { eager: true })
  signatures?: SignatureEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.need, { eager: true })
  payments?: PaymentEntity[];

  @ManyToOne(() => ChildrenEntity, (child) => child.needs, { eager: true })
  child: ChildrenEntity;

  @ManyToOne(() => ProviderEntity, (p) => p.needs, { eager: true })
  provider?: ProviderEntity;
}

