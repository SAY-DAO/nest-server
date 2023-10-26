import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { PaymentMiddleware } from './middlewares/payment.middleware';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, SocialWorker, Child, Payment, UserFamily, Family, User],
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
    consumer.apply(PaymentMiddleware).forRoutes('payment');
  }
}
