import {
  Entity,
  PrimaryColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class BaseEntity {
  @ApiProperty()
  @PrimaryColumn('uuid')
  id: number

}
