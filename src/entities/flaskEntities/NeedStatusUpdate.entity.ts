import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({ name: 'need_status_updates' })
export class NeedStatusUpdate extends BaseEntity {
  @Column()
  need_id: number

  @Column()
  sw_id: number

  @Column()
  old_status: number

  @Column()
  new_status: number

}
