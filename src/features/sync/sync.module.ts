import { Module } from '@nestjs/common';
import { NeedEntity } from '../../entities/need.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { SyncService } from './sync.service';
import { NgoService } from '../ngo/ngo.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from 'src/entities/status.entity';
import { LocationEntity } from 'src/entities/location.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { LocationService } from '../location/location.service';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { ProviderService } from '../provider/provider.service';
import { ProviderEntity } from 'src/entities/provider.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Countries } from 'src/entities/flaskEntities/countries.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        SocialWorker,
        Countries,
        Need,
        NGO,
        Cities,
        Child,
        Payment,
        UserFamily,
        Family,
        User,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ChildrenEntity,
      NgoEntity,
      NgoArrivalEntity,
      VariableEntity,
      NeedEntity,
      PaymentEntity,
      ReceiptEntity,
      ContributorEntity,
      AllUserEntity,
      StatusEntity,
      LocationEntity,
      EthereumAccountEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
      ChildrenPreRegisterEntity,
    ]), // add entity and services to be available in the module
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [],
  providers: [
    LocationService,
    SyncService,
    NgoService,
    ChildrenService,
    NeedService,
    PaymentService,
    ReceiptService,
    UserService,
    StatusService,
    ProviderService,
  ], // add entity and services to be available in the module
})
export class SyncModule {}
