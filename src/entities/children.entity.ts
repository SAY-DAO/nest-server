import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { BaseEntity } from './BaseEntity';
import { EducationEnum, HousingEnum } from '../types/interfaces/interface';
import { NgoEntity } from './ngo.entity';
import { ContributorEntity } from './contributor.entity';

@Entity()
export class ChildrenEntity extends BaseEntity {
  @Column()
  flaskId: number;

  @Column({ nullable: true })
  flaskConfirmUser?: number; //confirmUser from flask

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  awakeAvatarUrl: string;

  @Column({ nullable: true })
  adultAvatarUrl: string;

  @Column({ type: "hstore", hstoreType: "object" })
  bioSummaryTranslations: Record<string, string>;

  @Column({ type: "hstore", hstoreType: "object" })
  bioTranslations: Record<string, string>;

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
  flaskSwId: number;

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
  nationality: number;

  @Column({ nullable: true })
  sayFamilyCount: number;

  @Column({ nullable: true })
  sayName: string;

  @Column({ type: "hstore", hstoreType: "object" })
  sayNameTranslations: Record<string, string>;

  @Column({ nullable: true })
  sleptAvatarUrl: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  ngoId: number;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;

  @Column({ nullable: true })
  voiceUrl: string;

  @OneToMany(() => NeedEntity, (need) => need.child)
  needs?: NeedEntity[]

  @ManyToOne(() => NgoEntity, (n) => n.children, { eager: true })
  ngo: NgoEntity;

  @ManyToOne(() => ContributorEntity, (s) => s.children, { eager: true })
  socialWorker: ContributorEntity;

  @ManyToOne(() => ContributorEntity, (s) => s.children, { eager: false })
  supervisor: ContributorEntity;
}

