import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { MilestoneController } from './milestone.controller';
import { MilestoneService } from './milestone.service';
import { EpicEntity } from '../../entities/epic.enitity';
import { EpicService } from '../epic/epic.service';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MileStoneEntity, ChildrenEntity, NeedEntity, EpicEntity, UserEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [MilestoneController],
  providers: [MilestoneService, EpicService, ChildrenService, NeedService, UserService],
})
export class MilestoneModule { }
