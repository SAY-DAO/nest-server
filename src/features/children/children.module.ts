import { HttpModule } from '@nestjs/axios';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { ChildrenMiddleware } from './middlewares/children.middleware';
import { VariableEntity } from 'src/entities/variable.entity';
import { UserService } from '../user/user.service';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { LocationService } from '../location/location.service';
import { LocationEntity } from 'src/entities/location.entity';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { DownloadService } from '../download/download.service';
import { NgoService } from '../ngo/ngo.service';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { Countries } from 'src/entities/flaskEntities/countries.entity';
import { SyncService } from '../sync/sync.service';
import { ReceiptService } from '../receipt/receipt.service';
import { PaymentService } from '../payment/payment.service';
import { StatusService } from '../status/status.service';
import { ProviderService } from '../provider/provider.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        Child,
        Payment,
        SocialWorker,
        UserFamily,
        Family,
        User,
        Cities,
        NGO,
        Countries,
        Payment,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ChildrenEntity,
      NeedEntity,
      VariableEntity,
      NgoEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity,
      LocationEntity,
      NgoEntity,
      NgoArrivalEntity,
      ReceiptEntity,
      PaymentEntity,
      StatusEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [ChildrenController],
  providers: [
    ChildrenService,
    NeedService,
    ChildrenService,
    UserService,
    LocationService,
    NgoService,
    DownloadService,
    SyncService,
    ReceiptService,
    PaymentService,
    StatusService,
    ProviderService,
  ],
})
export class ChildrenModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ChildrenMiddleware)
      .exclude(
        {
          path: 'children/avatars/images/:fileName',
          method: RequestMethod.GET,
        },
        { path: 'children/voices/:fileName', method: RequestMethod.GET },
        { path: `children/preregister/old`, method: RequestMethod.GET },
      )
      .forRoutes(ChildrenController);
  }
}
