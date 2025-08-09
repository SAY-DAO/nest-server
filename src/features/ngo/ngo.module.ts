import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { LocationEntity } from '../../entities/location.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderJoinNeedEntity } from '../../entities/provider.Join.need..entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { StatusEntity } from '../../entities/status.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { ChildrenService } from '../children/children.service';
import { LocationService } from '../location/location.service';
import { NeedService } from '../need/need.service';
import { PaymentService } from '../payment/payment.service';
import { ProviderService } from '../provider/provider.service';
import { ReceiptService } from '../receipt/receipt.service';
import { StatusService } from '../status/status.service';
import { SyncService } from '../sync/sync.service';
import { UserService } from '../user/user.service';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { NgoMiddleware } from './middlewares/ngo.middleware';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Countries } from '../../entities/flaskEntities/countries.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Child,
        NGO,
        Need,
        SocialWorker,
        Payment,
        Cities,
        UserFamily,
        Family,
        User,
        Countries,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),

    TypeOrmModule.forFeature([
      NgoEntity,
      NgoArrivalEntity,
      NeedEntity,
      VariableEntity,
      LocationEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
      StatusEntity,
      ChildrenEntity,
      ReceiptEntity,
      PaymentEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity,
      NgoPreRegisterEntity
    ]),
  ],
  controllers: [NgoController],
  providers: [
    NgoService,
    UserService,
    SyncService,
    NeedService,
    ChildrenService,
    ReceiptService,
    PaymentService,
    StatusService,
    LocationService,
    ProviderService,
  ],
})
export class NgoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NgoMiddleware).exclude(
      { path: 'ngo/preregister', method: RequestMethod.POST },
    ).forRoutes(NgoController);
  }
}
