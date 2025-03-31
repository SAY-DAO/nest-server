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
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { MileStoneMiddleware } from './middlewares/milestone.middleware';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        Child,
        Payment,
        UserFamily,
        Family,
        User,
        Receipt,
        NeedReceipt,
      ],
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
      ChildrenPreRegisterEntity,
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
