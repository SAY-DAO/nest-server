import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllUserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { PaymentService } from './payment.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { PaymentController } from './payment.controller';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { PaymentMiddleware } from './middlewares/payment.middleware';
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
      PaymentEntity,
      NeedEntity,
      VariableEntity,
      AllUserEntity,
      ContributorEntity,
      ChildrenEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, UserService, NeedService, ChildrenService],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PaymentMiddleware)
      .exclude({ path: 'payment/new/cart', method: RequestMethod.POST })
      .exclude({ path: 'payment/verify(.*)', method: RequestMethod.GET })
      .forRoutes(PaymentController);
  }
}
