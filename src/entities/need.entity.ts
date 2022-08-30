import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class NeedEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Index({ unique: true })
  @Column()
  need_id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  affiliateLinkUrl: string;

  @Column({ nullable: true })
  bank_track_id: string;

  @Column()
  category: number;

  @Column()
  childGeneratedCode: string;

  @Column()
  childSayName: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  child_delivery_date: Date;

  @Column({ nullable: true })
  child_id: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  confirmDate: Date;

  @Column({ nullable: true })
  confirmUser: number;

  @Column({ nullable: true })
  cost: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  created: Date;

  @Column()
  created_by_id: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column()
  description: string;

  @Column("simple-json", { nullable: true })
  description_translation_en: { en: string, fa: string };

  @Column({ nullable: true })
  details: string;

  @Column()
  doing_duration: number;

  @Column()
  donated: number;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  doneAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  expected_delivery_date: Date;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  need_retailer_img: string;

  @Column({ nullable: true })
  informations: string;

  @Column()
  isConfirmed: boolean;

  @Column()
  isDeleted: boolean;

  @Column({ nullable: true })
  isDone: boolean;

  @Column()
  isReported: boolean;

  @Column()
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

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
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

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  purchase_date: Date;

  @Column()
  receipt_count: number;

  @Column({ nullable: true })
  receipts: string;

  @Column()
  status: number;

  @Column({ nullable: true })
  status_description: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  status_updated_at: Date;

  @Column()
  type: number;

  @Column()
  type_name: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  unavailable_from: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  unconfirmed_at: Date;

  @Column()
  unpaid_cost: number;

  @Column()
  unpayable: boolean;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  unpayable_from: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated: Date;
}
