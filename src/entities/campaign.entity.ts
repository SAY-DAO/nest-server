import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { AllUserEntity } from './user.entity';
import { CampaignEnum, CampaignTypeEnum } from 'src/types/interfaces/interface';
import { SignatureEntity } from './signature.entity';
import { NeedEntity } from './need.entity';

@Entity()
export class CampaignEntity extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  campaign: CampaignEnum;

  @Column({ nullable: false })
  type: CampaignTypeEnum;

  @Column({ nullable: false, unique: true })
  campaignNumber: number;

  @ManyToMany(() => AllUserEntity, (u) => u.campaigns, {
    eager: true,
  })
  @JoinTable()
  receivers: AllUserEntity[];

  @ManyToMany(() => SignatureEntity, (s) => s.campaigns, {
    eager: true,
  })
  @JoinTable()
  contentSignatures?: SignatureEntity[];

  @ManyToMany(() => NeedEntity, (n) => n.campaigns, {
    eager: true,
  })
  @JoinTable()
  contentNeeds?: NeedEntity[];
}
