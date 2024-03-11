import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Family extends BaseEntity {
  @Column()
  id_child: number;

  @Column()
  isDeleted: boolean
}