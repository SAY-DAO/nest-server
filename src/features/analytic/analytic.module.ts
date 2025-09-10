import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from '../../entities/flaskEntities/need.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { UserService } from '../user/user.service';
import { AllUserEntity } from '../../entities/user.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { FamilyService } from '../family/family.service';
import { AnalyticMiddleware } from './middlewares/analytic.middleware';
import { PaymentEntity } from '../../entities/payment.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { NgoService } from '../ngo/ngo.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';
import { AnalyticPublicController } from './public.analytic.controller';
import { AnalyticPublicService } from './public.analytic.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CheckPointEntity } from 'src/entities/checkpoint.entity';

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
      NgoEntity,
      NgoArrivalEntity,
      NgoPreRegisterEntity,
      CheckPointEntity,
    ]),
    CacheModule.register({
      ttl: Number(process.env.REPORTS_CACHE_TTL ?? 10), // seconds
      max: 100,
    }),
  ],

  controllers: [AnalyticController, AnalyticPublicController],
  providers: [
    AnalyticService,
    AnalyticPublicService,
    UserService,
    NeedService,
    ChildrenService,
    FamilyService,
    NgoService,
  ],
})
export class AnalyticModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnalyticMiddleware)
      .exclude(
        { path: 'analytic/public/summary', method: RequestMethod.GET },
        { path: 'analytic/public/transactions', method: RequestMethod.GET },
        {
          path: 'analytic/public/season-comparison',
          method: RequestMethod.GET,
        },
        { path: 'analytic/public/multi-payers', method: RequestMethod.GET },
        { path: 'analytic/public/logs', method: RequestMethod.GET },
        {
          path: 'analytic/public/needs-frequency-clustered',
          method: RequestMethod.GET,
        },
        {
          path: 'analytic/public/checkpoints',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('analytic');
  }
}
