import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  Index,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

@Entity()
export class NeedEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Index({ unique: true })
  @Column()
  need_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  affiliateLinkUrl: string;

  @Column({ nullable: true })
  bank_track_id: string;

  @Column({ nullable: true })
  category: number;

  @Column({ nullable: true })
  childGeneratedCode: string;

  @Column({ nullable: true })
  childSayName: string;

  @Column({ type: 'timestamptz', nullable: true })
  child_delivery_date: Date;

  @Column()
  child_id: number;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate: Date;

  @Column({ nullable: true })
  confirmUser: number;

  @Column({ nullable: true })
  cost: number;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ nullable: true })
  created_by_id: number;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  @Column({ nullable: true })
  description: string;

  @Column("simple-json", { nullable: true })
  description_translation_en: { en: string, fa: string };

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  doing_duration: number;

  @Column({ nullable: true })
  donated: number;

  @Column({ type: 'timestamptz', nullable: true })
  doneAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expected_delivery_date: Date;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  need_retailer_img: string;

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

  @Column("simple-json", { nullable: true })
  title_translations: { en: string, fa: string };

  @Column({ nullable: true })
  ngoAddress: string;

  @Column({ nullable: true })
  ngoId: number;

  @Column({ nullable: true })
  ngoName: string;

  @Column({ type: 'timestamptz', nullable: true })
  ngo_delivery_date: Date;

  @Column({ nullable: true })
  oncePurchased: boolean;

  @Column({ nullable: true })
  paid: number;

  @Column("simple-array", { nullable: true })
  payments: [];

  @Column({ nullable: true })
  progress: string;

  @Column({ nullable: true })
  purchase_cost: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchase_date: Date;

  @Column({ nullable: true })
  receipt_count: number;

  @Column({ nullable: true })
  receipts: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  status_description: string;

  @Column({ type: 'timestamptz', nullable: true })
  status_updated_at: Date;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  type_name: string;

  @Column({ type: 'timestamptz', nullable: true })
  unavailable_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unconfirmed_at: Date;

  @Column({ nullable: true })
  unpaid_cost: number;

  @Column({ nullable: true })
  unpayable: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  unpayable_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;

  @ManyToMany(() => UserEntity, user => user.doneNeeds, {
    eager: true // eg: need.participants is forced to be included
  })
  @JoinTable()
  participants: UserEntity[]
}
