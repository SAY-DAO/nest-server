import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import { AllUserEntity } from './user.entity';
@Entity()
export class CommentEntity extends BaseEntity {
  @Column({ nullable: true })
  vRole: VirtualFamilyRole;

  @Column({ nullable: true })
  content: string;

  @Column()
  flaskUserId: number;

  @Column()
  flaskNeedId: number;

  @ManyToOne(() => NeedEntity, (n) => n.comments, {
    eager: false,
    nullable: false,
  })
  need: NeedEntity;

  @ManyToOne(() => AllUserEntity, (n) => n.comments, {
    eager: false,
    nullable: false,
  })
  user: AllUserEntity;
}
