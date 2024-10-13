import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class NeedFamily extends BaseEntity {
  @Column()
  id_user: number;

  @Column()
  id_need: number;

  @Column()
  id_family: number;

  @Column()
  type: string;

  @Column({ name: 'user_role' })
  flaskFamilyRole: number

  @Column()
  isDeleted: boolean

}
