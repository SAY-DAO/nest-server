import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { BaseEntity } from './BaseEntity';
import { AllUserEntity } from './user.entity';
import { PanelContributors, } from 'src/types/interfaces/interface';


@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: true })
  flaskNgoId?: number;

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker, { eager: false })
  children?: ChildrenEntity[];

  @OneToMany(() => NeedEntity, (c) => c.socialWorker, { eager: false })
  createdNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.auditor, { eager: false })
  auditedNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.purchaser, { eager: false })
  purchasedNeeds?: NeedEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: false })
  ngo?: NgoEntity;

  @ManyToOne(() => AllUserEntity, (n) => n.contributions, { eager: false })
  user?: AllUserEntity;

  @Column({ type: 'enum', enum: PanelContributors, nullable: true })
  panelRole: PanelContributors;

  @Column({ nullable: true })
  panelRoleName: string;
}



