import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class user {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id2: number

  @Column()
  id: number
}
