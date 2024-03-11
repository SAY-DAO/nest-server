import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { MidjourneyController } from './midjourney.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MidjourneyEntity } from 'src/entities/midjourney.entity';
import { WalletService } from '../wallet/wallet.service';
import { NeedEntity } from 'src/entities/need.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { MidjourneyMiddleware } from './middlewares/midjourney.middleware';
import { DownloadService } from '../download/download.service';
import { HttpModule } from '@nestjs/axios';
import { FamilyService } from '../family/family.service';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

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
