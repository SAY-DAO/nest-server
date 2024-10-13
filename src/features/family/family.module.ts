import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { FamilyMiddleware } from './middlewares/family.middleware';
import { ChildrenService } from '../children/children.service';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { WalletService } from '../wallet/wallet.service';
import { SignatureEntity } from 'src/entities/signature.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

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
