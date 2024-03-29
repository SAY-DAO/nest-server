import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';
import { SAYPlatformRoles } from '../types/interfaces/interface';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import { AllUserEntity } from './user.entity';
import { CampaignEntity } from './campaign.entity';

@Entity()
export class SignatureEntity extends BaseEntity {
  @Column({ nullable: false })
  verifyingContract: string;

  @Column({ nullable: true, default: false })
  isVerified: boolean;

  @Column({ nullable: false })
  signerAddress: string;

  @ManyToOne(() => AllUserEntity, (user) => user.signatures, {
    eager: false,
    nullable: false,
  })
  user: AllUserEntity;

  @Column()
  flaskUserId: number;

  @Column()
  flaskNeedId: number;

  @Column({ unique: true })
  hash: string;

  @Column({ type: 'enum', enum: SAYPlatformRoles, nullable: false })
  role: SAYPlatformRoles;

  @ManyToOne(() => NeedEntity, (n) => n.signatures, {
    eager: false,
    nullable: false,
  })
  need: NeedEntity;
}
