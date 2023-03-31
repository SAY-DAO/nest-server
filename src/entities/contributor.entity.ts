import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { BaseEntity } from './BaseEntity';


@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskId: number;

  @Column({ nullable: true })
  flaskNgoId?: number;

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker)
  children?: ChildrenEntity[];

  @OneToMany(() => NeedEntity, (c) => c.socialWorker)
  createdNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.auditor)
  auditedNeeds?: NeedEntity[];

  @OneToMany(() => NeedEntity, (c) => c.purchaser)
  purchasedNeeds?: NeedEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: false })
  ngo?: NgoEntity;

}



