import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { ChildrenEntity } from './children.entity';
import { NgoEntity } from './ngo.entity';
import { BaseEntity } from './BaseEntity';
import { AllUserEntity } from './user.entity';
import { PanelContributors } from 'src/types/interfaces/interface';
import { ChildrenPreRegisterEntity } from './childrenPreRegister.entity';

@Entity() // panel admin, sw, auditor, ...
export class ContributorEntity extends BaseEntity {
  @Column({ nullable: false })
  flaskUserId: number;

  @Column({ nullable: false })
  flaskNgoId: number;

  @OneToMany(() => ChildrenEntity, (c) => c.socialWorker, { eager: false })
  children?: ChildrenEntity[];

  @OneToMany(() => ChildrenPreRegisterEntity, (c) => c.socialWorker, {
    eager: false,
  })
  preRegisters?: ChildrenPreRegisterEntity[];

  @ManyToOne(() => NgoEntity, (n) => n.socialWorkers, { eager: false })
  ngo?: NgoEntity;

  @ManyToOne(() => AllUserEntity, (n) => n.contributions, { eager: false })
  user?: AllUserEntity;

  @Column({ type: 'enum', enum: PanelContributors, nullable: false })
  panelRole: PanelContributors;

  @Column({ nullable: false })
  panelRoleName: string;
}
