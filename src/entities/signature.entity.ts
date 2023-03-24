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

@Entity()
export class SignatureEntity extends BaseEntity {
  @OneToOne(() => AllUserEntity, { eager: true })
  @JoinColumn()
  signer: AllUserEntity;

  @Column()
  flaskUserId: number;

  @Column()
  flaskNeedId: number;

  @Column({ unique: true })
  hash: string;

  @Column({ type: 'enum', enum: SAYPlatformRoles, nullable: true })
  role: SAYPlatformRoles;

  @ManyToOne(() => NeedEntity, (need) => need.signatures, { eager: false })
  need: NeedEntity;

}
