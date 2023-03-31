import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { SAYPlatformRoles } from '../types/interfaces/interface';
import { BaseEntity } from './BaseEntity';
import { AllUserEntity } from './user.entity';
import { IpfsEntity } from './ipfs.entity';

@Entity()
export class SignatureEntity extends BaseEntity {
  @ManyToOne(() => AllUserEntity, (user) => user.signatures, { eager: false })
  user: AllUserEntity;

  @Column()
  flaskUserId: number;

  @Column()
  flaskNeedId: number;

  @Column({ unique: true })
  hash: string;

  @Column({ type: 'enum', enum: SAYPlatformRoles, nullable: true })
  role: SAYPlatformRoles;

  @ManyToOne(() => IpfsEntity, (ipfs) => ipfs.signatures, { eager: false })
  ipfs: IpfsEntity;
}
