import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class NgoPreRegisterEntity extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: false })
  city: number;

  @Column({ nullable: false })
  state: number;

  @Column({ nullable: false })
  country: number;

  @Column({ nullable: false })
  postalAddress: string;

  @Column({ nullable: false })
  emailAddress: string;

  @Column({ nullable: false })
  phoneNumber: number;

  @Column({ nullable: false })
  swPhoneNumber: number;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: false })
  docUrl: string;

  @Column({ nullable: false })
  idCardUrl: string;

}
