import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { NgoEntity } from '../../entities/ngo.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, Child], 'flaskPostgres'),
    TypeOrmModule.forFeature([ChildrenEntity, NeedEntity, NgoEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService, NeedService, ChildrenService],
})
export class ChildrenModule { }
