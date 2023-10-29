import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import {
  EducationEnum,
  HousingEnum,
  PreRegisterStatusEnum,
  SchoolTypeEnum,
  SexEnum,
} from '../types/interfaces/interface';
import { LocationEntity } from './location.entity';
import { ContributorEntity } from './contributor.entity';
import { NgoEntity } from './ngo.entity';

@Entity()
export class ChildrenPreRegisterEntity extends BaseEntity {
  @Column({ nullable: false })
  awakeUrl: string;

  @Column({ nullable: false })
  sleptUrl: string;

  @Column({ type: 'hstore', hstoreType: 'object', nullable: false })
  sayName: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object', nullable: true })
  firstName: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object', nullable: true })
  lastName: Record<string, string>;

  @Column({ type: 'hstore', hstoreType: 'object', nullable: true })
  bio: Record<string, string>;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlaceId: number;

  @Column({ nullable: true })
  flaskChildId: number;

  @Column({ nullable: true })
  birthPlaceName: string;

  @Column({ nullable: true })
  city: number;

  @Column({ nullable: true })
  state: number;

  @Column({ nullable: true })
  country: number;

  @Column({ nullable: false })
  sex: SexEnum;

  @Column({ nullable: true })
  educationLevel: EducationEnum;

  @Column({ nullable: true })
  schoolType: SchoolTypeEnum;

  @Column({ nullable: true })
  housingStatus: HousingEnum;

  @Column({ nullable: true })
  flaskSwId: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  familyCount: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  flaskNgoId: number;

  @Column({ nullable: true })
  voiceUrl: string;

  @Column({ nullable: true, default: PreRegisterStatusEnum.NOT_REGISTERED })
  status: PreRegisterStatusEnum;

  @ManyToOne(() => LocationEntity, (n) => n.preRegisters, { eager: true })
  location: LocationEntity;

  @ManyToOne(() => ContributorEntity, (s) => s.preRegisters, { eager: true })
  socialWorker: ContributorEntity;

  @ManyToOne(() => NgoEntity, (n) => n.preRegisters, { eager: true })
  ngo: NgoEntity;
}
