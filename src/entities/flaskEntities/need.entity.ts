import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';


@Entity()
export class Need extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  img: string;

  @Column({ type: "hstore", hstoreType: "object" })
  name_translations: Record<string, string>

  @Column({ nullable: true })
  doing_duration: number;

  @Column({ nullable: true })
  affiliateLinkUrl?: string;

  @Column({ nullable: true })
  bank_track_id?: string;

  @Column({ nullable: true })
  category: number;

  @Column({ type: 'timestamptz', nullable: true })
  child_delivery_date?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate?: Date;

  @Column({ nullable: true })
  _cost: number;

  @Column({ type: "hstore", hstoreType: "object" })
  description_translations: Record<string, string>

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  informations: string;

  @Column({ type: 'timestamptz', nullable: true })
  doneAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expected_delivery_date: Date;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isUrgent: boolean;

  @Column({ nullable: true })
  link: string;

  @Column({ type: 'timestamptz', nullable: true })
  ngo_delivery_date: Date;

  @Column({ nullable: true })
  purchase_cost: number;

  @Column({ type: 'timestamptz', nullable: true })
  purchase_date: Date;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'timestamptz', nullable: true })
  status_updated_at: Date;

  @Column({ nullable: true })
  type: number;

  @Column({ type: 'timestamptz', nullable: true })
  unavailable_from?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unconfirmed_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @Column()
  child_id: number;

  @Column({ name: 'dkc' })
  deliveryCode: string;

  @Column()
  created_by_id: number;

  @Column()
  confirmUser: number;

}

