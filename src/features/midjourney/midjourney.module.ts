import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { MidjourneyController } from './midjourney.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MidjourneyEntity } from '../../entities/midjourney.entity';
import { WalletService } from '../wallet/wallet.service';
import { NeedEntity } from '../../entities/need.entity';
import { SignatureEntity } from '../../entities/signature.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { MidjourneyMiddleware } from './middlewares/midjourney.middleware';
import { DownloadService } from '../download/download.service';
import { HttpModule } from '@nestjs/axios';
import { FamilyService } from '../family/family.service';
import { Family } from '../../entities/flaskEntities/family.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature(
      [
        Child,
        Need,
        SocialWorker,
        User,
        Family,
        UserFamily,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      MidjourneyEntity,
      VariableEntity,
      NeedEntity,
      SignatureEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [MidjourneyController],
  providers: [
    MidjourneyService,
    WalletService,
    NeedService,
    UserService,
    DownloadService,
    FamilyService,
  ],
})
export class MidjourneyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MidjourneyMiddleware)
      .exclude('midjourney/images/:flaskNeedId/:index')
      .exclude('midjourney/bad/images/')
      .forRoutes(MidjourneyController);
  }
}
