import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import {
  EducationEnum,
  HousingEnum,
  SexEnum,
} from '../types/interfaces/interface';
import { LocationEntity } from './location.entity';

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

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: number;

  @Column({ nullable: true })
  city: number;

  @Column({ nullable: true })
  state: number;

  @Column({ nullable: true })
  country: number;

  @Column({ nullable: true })
  sex: SexEnum;

  @Column({ nullable: true })
  education: EducationEnum;

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

  @Column({ nullable: true, default: false })
  isApproved: boolean;

  @ManyToOne(() => LocationEntity, (n) => n.ngos, { eager: true })
  location: LocationEntity;
}
