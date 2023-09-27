import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { StepEntity } from '../../entities/step.entity';
import { StepService } from '../step/step.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { AllUserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { MileStoneMiddleware } from './middlewares/milestone.middleware';
import { VariableEntity } from 'src/entities/variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, SocialWorker, Child, Payment, UserFamily, Family, User],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      MileStoneEntity,
      ChildrenEntity,
      VariableEntity,
      NeedEntity,
      StepEntity,
      ContributorEntity,
      AllUserEntity,
      PaymentEntity,
      EthereumAccountEntity,
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
    PaymentService,
  ],
})
export class MilestoneModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MileStoneMiddleware).forRoutes('milestone');
  }
}
