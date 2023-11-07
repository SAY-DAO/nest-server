import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { AllUserEntity } from './user.entity';
import {
  CampaignNameEnum,
  CampaignTypeEnum,
} from 'src/types/interfaces/interface';
import { SignatureEntity } from './signature.entity';
import { NeedEntity } from './need.entity';

@Entity()
export class CampaignEntity extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  campaignName: CampaignNameEnum;

  @Column({ nullable: false })
  type: CampaignTypeEnum;

  @Column({ nullable: false, unique: true })
  campaignCode: string;

  @ManyToMany(() => AllUserEntity, (u) => u.campaigns, {
    eager: true,
  })
  @JoinTable()
  receivers: AllUserEntity[];
}
