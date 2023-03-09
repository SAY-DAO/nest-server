import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MileStoneEntity } from '../../../entities/milestone.entity';
import { MilestoneController } from './milestone.controller';
import { MilestoneService } from './milestone.service';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { ChildrenEntity } from '../../../entities/children.entity';
import { NeedEntity } from '../../../entities/need.entity';
import { StepEntity } from '../../../entities/step.entity';
import { StepService } from '../step/step.service';
import { PaymentEntity } from '../../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { FamilyEntity, ContributorEntity, AllUserEntity } from '../../../entities/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MileStoneEntity,
      ChildrenEntity,
      NeedEntity,
      StepEntity,
      FamilyEntity,
      ContributorEntity,
      AllUserEntity,
      PaymentEntity
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
    PaymentService
  ],
})
export class MilestoneModule { }
