import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { NeedService } from '../need/need.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { NeedEntity } from 'src/entities/need.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        Child,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
    ]),
  ],
  controllers: [],
  providers: [ScheduleService, NeedService],
})
export class ScheduleTaskModule {}
