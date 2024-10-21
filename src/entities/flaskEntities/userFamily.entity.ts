import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class UserFamily extends BaseEntity {
  @Column()
  id_user: number;

  @Column()
  id_family: number;

  @Column({ name: 'userRole' })
  flaskFamilyRole: number;

  @Column()
  isDeleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  created: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated: Date;
}
