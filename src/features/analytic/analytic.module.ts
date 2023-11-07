import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { UserService } from '../user/user.service';
import { AllUserEntity } from 'src/entities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from 'src/entities/children.entity';
import { FamilyService } from '../family/family.service';
import { AnalyticMiddleware } from './middlewares/analytic.middleware';
import { PaymentEntity } from 'src/entities/payment.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        User,
        SocialWorker,
        Need,
        Child,
        NGO,
        Payment,
        Family,
        UserFamily,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      AllUserEntity,
      ContributorEntity,
      EthereumAccountEntity,
      NeedEntity,
      VariableEntity,
      ChildrenEntity,
      PaymentEntity,
      ChildrenPreRegisterEntity,
    ]),
  ],

  controllers: [AnalyticController],
  providers: [
    AnalyticService,
    UserService,
    NeedService,
    ChildrenService,
    FamilyService,
  ],
})
export class AnalyticModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AnalyticMiddleware).forRoutes('analytic');
  }
}
