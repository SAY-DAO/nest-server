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
export class ChildrenEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Index({ unique: true })
  @Column()
  child_id: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  awakeAvatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  bioSummary: string;

  @Column("simple-json", { nullable: true })
  bio_summary_translations: { en: string; fa: string };

  @Column("simple-json", { nullable: true })
  bio_translations: { en: string; fa: string };

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  city: number;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate: Date;

  @Column({ nullable: true })
  confirmUser: number;

  @Column({ nullable: true })
  country: number;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ nullable: true })
  done_needs_count: number;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  existence_status: number;

  @Column({ nullable: true })
  familyCount: number;

  @Column({ nullable: true })
  gender: boolean;

  @Column({ nullable: true })
  generatedCode: string;

  @Column({ nullable: true })
  housingStatus: string;

  @Column({ nullable: true })
  id_ngo: number;

  @Column({ nullable: true })
  id_social_worker: number;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isMigrated: boolean;

  @Column({ nullable: true })
  is_gone: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  migrateDate: Date;

  @Column({ nullable: true })
  migratedId: number;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  sayFamilyCount: number;

  @Column({ nullable: true })
  sayName: string;

  @Column("simple-json", { nullable: true })
  sayname_translations: { en: string; fa: string };

  @Column({ nullable: true })
  sleptAvatarUrl: string;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;

  @Column({ nullable: true })
  voiceUrl: string;
}
