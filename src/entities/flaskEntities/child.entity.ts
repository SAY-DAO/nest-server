import { ChildExistence } from 'src/types/interfaces/interface';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Child extends BaseEntity {
  @Column()
  id_ngo: number;

  @Column({ nullable: true })
  confirmUser?: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  awakeAvatarUrl: string;

  @Column({ nullable: true })
  sleptAvatarUrl: string;

  @Column({ nullable: true })
  adult_avatar_url: string;

  @Column({ type: 'hstore', hstoreType: 'object' })
  bio_summary_translations: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object' })
  firstName_translations: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object' })
  lastName_translations: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object' })
  bio_translations: Record<string, string>;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  city: number;

  @Column({ type: 'timestamptz', nullable: true })
  confirmDate: Date;

  @Column({ nullable: true })
  country: number;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ nullable: true })
  education: number;

  @Column({ nullable: true })
  existence_status: ChildExistence;

  @Column({ nullable: true })
  familyCount: number;

  @Column({ nullable: true })
  generatedCode: string;

  @Column({ nullable: true })
  housingStatus: number;

  @Column({ nullable: true })
  id_social_worker: number;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isMigrated: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  migrateDate: Date;

  @Column({ nullable: true })
  migratedId: number;

  @Column({ nullable: true })
  nationality: number;

  @Column({ nullable: true })
  sayFamilyCount: number;

  @Column({ type: 'hstore', hstoreType: 'object' })
  sayname_translations: Record<string, string>;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;

  @Column({ nullable: true })
  voiceUrl: string;

  family: any;
}
