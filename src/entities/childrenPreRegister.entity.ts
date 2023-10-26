import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import {
  EducationEnum,
  HousingEnum,
  SexEnum,
} from '../types/interfaces/interface';

@Entity()
export class ChildrenPreRegisterEntity extends BaseEntity {
  @Column({ nullable: false })
  awakeUrl: string;

  @Column({ nullable: false })
  sleptUrl: string;

  @Column({ type: 'hstore', hstoreType: 'object', nullable: false })
  sayName: Record<string, string>;

  @Column({ nullable: true })
  bioTranslations: string;

  @Column({ type: 'timestamptz', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: number;

  @Column({ nullable: true })
  city: number;

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
  phoneNumber: string;

  @Column({ nullable: true })
  flaskNgoId: number;

  @Column({ nullable: true })
  voiceUrl: string;
}
