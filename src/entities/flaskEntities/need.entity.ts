import {
  Entity,
  Column,
} from 'typeorm';

import { BaseEntity } from './BaseEntity';


@Entity()
export class Need extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  imageUrl: string;
}

