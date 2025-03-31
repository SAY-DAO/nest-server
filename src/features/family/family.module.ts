import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { FamilyMiddleware } from './middlewares/family.middleware';
import { ChildrenService } from '../children/children.service';
import { Child } from '../../entities/flaskEntities/child.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { WalletService } from '../wallet/wallet.service';
import { SignatureEntity } from '../../entities/signature.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ContributorEntity } from '../../entities/contributor.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        Family,
        User,
        Child,
        SocialWorker,
        UserFamily,
        Payment,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ChildrenEntity,
      VariableEntity,
      NeedEntity,
      SignatureEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      PaymentEntity,
      ChildrenPreRegisterEntity,
    ]),
  ],
  controllers: [FamilyController],
  providers: [
    FamilyService,
    ChildrenService,
    WalletService,
    NeedService,
    UserService,
    PaymentService,
  ],
})
export class FamilyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FamilyMiddleware).forRoutes('family');
  }
}
