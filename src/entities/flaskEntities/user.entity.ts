import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {
  [x: string]: any; // when in analytic.service user.payments not available from flask this helps
  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  emailAddress?: string;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  created?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate?: Date;

  @Column()
  is_email_verified: boolean;

  @Column()
  is_phonenumber_verified: boolean;

  @Column()
  isDeleted: boolean;
}

@Entity() // panel admin, sw, auditor, ...
export class SocialWorker extends BaseEntity {
  @Column({ nullable: true, name: 'first_name' })
  firstName?: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  updated?: Date;

  @Column({ nullable: true })
  birth_certificate_number?: string;

  @Column({ nullable: true })
  id_card_url?: string;

  @Column({ nullable: true })
  generated_code?: string;

  @Column({ nullable: true })
  city_id?: string;

  @Column({ nullable: true })
  id_number?: string;

  @Column({ nullable: true })
  passport_number?: string;

  @Column({ nullable: true })
  postal_address?: string;

  @Column({ nullable: true })
  gender?: boolean;

  @Column({ nullable: true })
  bank_account_number?: string;

  @Column({ nullable: true })
  bank_account_sheba_number?: string;

  @Column({ nullable: true })
  birth_date?: Date;

  @Column({ nullable: true })
  telegram_id?: string;

  @Column({ nullable: true })
  is_coordinator?: boolean;

  @Column({ nullable: true })
  ngo_id?: number;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ nullable: true })
  emergency_phone_number?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  passport_url?: string;

  @Column({ nullable: true, name: 'username' })
  userName?: string;

  @Column({ nullable: true })
  created?: Date;

  @Column({ nullable: true })
  last_login_date?: Date;

  @Column({ nullable: true })
  locale?: string;

  @Column({ nullable: true })
  type_id?: number;

  @Column({ nullable: true })
  is_active?: boolean;
}

@Entity()
export class FamilyEntity extends User {
  @Index({ unique: true })
  @Column({ nullable: false })
  flaskId: number;
}
