import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class ContributionEntity extends BaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;
}
