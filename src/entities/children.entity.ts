import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { BaseEntity } from './BaseEntity';
import { EducationEnum, HousingEnum } from '../types/interface';

@Entity()
export class ChildrenEntity extends BaseEntity {
  @Index({ unique: true })
  @Column()
  childId: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  awakeAvatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  bioSummary: string;

  @Column("simple-json", { nullable: true })
  bioSummaryTranslations: { en: string; fa: string };

  @Column("simple-json", { nullable: true })
  bioTranslations: { en: string; fa: string };

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
  doneNeedsCount: number;

  @Column({ nullable: true })
  education: EducationEnum;

  @Column({ nullable: true })
  existenceStatus: number;

  @Column({ nullable: true })
  familyCount: number;

  @Column({ nullable: true })
  generatedCode: string;

  @Column({ nullable: true })
  housingStatus: HousingEnum;

  @Column({ nullable: true })
  ngoId: number;

  @Column({ nullable: true })
  idSocialWorker: number;

  @Column({ nullable: true })
  isConfirmed: boolean;

  @Column({ nullable: true })
  isDeleted: boolean;

  @Column({ nullable: true })
  isMigrated: boolean;

  @Column({ nullable: true })
  isGone: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  migrateDate: Date;

  @Column({ nullable: true })
  migratedId: number;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  sayFamilyCount: number;

  @Column({ nullable: true })
  sayName: string;

  @Column("simple-json", { nullable: true })
  sayNameTranslations: { en: string; fa: string };

  @Column({ nullable: true })
  sleptAvatarUrl: string;

  @Column({ nullable: true })
  status: number;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;

  @Column({ nullable: true })
  voiceUrl: string;

  @OneToMany(() => NeedEntity, (need) => need.child)
  needs?: NeedEntity[]
}
