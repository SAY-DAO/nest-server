import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { MilestoneController } from './milestone.controller';
import { MilestoneService } from './milestone.service';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';
import { StepEntity } from '../../entities/step.entity';
import { StepService } from '../step/step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MileStoneEntity,
      ChildrenEntity,
      NeedEntity,
      UserEntity,
      StepEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [MilestoneController],
  providers: [
    MilestoneService,
    ChildrenService,
    NeedService,
    UserService,
    StepService,
  ],
})
export class MilestoneModule {}
