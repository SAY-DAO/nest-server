import { Entity, Column, ManyToOne } from 'typeorm';
import { SAYPlatformRoles } from '../types/interfaces/interface';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import { AllUserEntity } from './user.entity';

@Entity()
export class SignatureEntity extends BaseEntity {
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

  @Column({ type: 'enum', enum: SAYPlatformRoles, nullable: true })
  role: SAYPlatformRoles;

  @ManyToOne(() => NeedEntity, (n) => n.signatures, {
    eager: false,
    nullable: false,
  })
  need: NeedEntity;
}
