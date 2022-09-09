import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { StepEntity } from '../../entities/step.entity';
import { StepService } from './step.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        StepEntity,
        ChildrenEntity,
        NeedEntity,
        UserEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [],
  providers: [
    StepService,
    ChildrenService,
    NeedService,
    UserService,
  ],
})
export class StepModule {}
