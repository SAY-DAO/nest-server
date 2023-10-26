import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenEntity } from 'src/entities/children.entity';
import { CityEntity } from 'src/entities/city.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { AllUserEntity } from 'src/entities/user.entity';
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
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NgoMiddleware } from './middlewares/ngo.middleware';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';

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
      ],
      'flaskPostgres',
    ),

    TypeOrmModule.forFeature([
      NgoEntity,
      NgoArrivalEntity,
      NeedEntity,
      VariableEntity,
      CityEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
      StatusEntity,
      ChildrenEntity,
      ReceiptEntity,
      PaymentEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity
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
    consumer.apply(NgoMiddleware).forRoutes('ngo');
  }
}
