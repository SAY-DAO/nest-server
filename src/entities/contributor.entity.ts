import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { BaseEntity } from './BaseEntity';


@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ nullable: false })
  flaskId: number;

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

}



