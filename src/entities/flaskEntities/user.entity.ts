import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ database: 'flaskPostgres' })
export class user {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: number


}
