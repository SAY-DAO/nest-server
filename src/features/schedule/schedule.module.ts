import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { NeedService } from '../need/need.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { FamilyService } from '../family/family.service';
import { Family } from 'src/entities/flaskEntities/family.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, SocialWorker, Child, User, Family],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([NeedEntity]),
  ],
  controllers: [],
  providers: [ScheduleService, NeedService, FamilyService],
})
export class ScheduleTaskModule {}
