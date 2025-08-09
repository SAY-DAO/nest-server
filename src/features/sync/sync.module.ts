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
import { AllUserEntity } from '../../entities/user.entity';
import { SyncService } from './sync.service';
import { NgoService } from '../ngo/ngo.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from '../../entities/status.entity';
import { LocationEntity } from '../../entities/location.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { LocationService } from '../location/location.service';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { ProviderService } from '../provider/provider.service';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderJoinNeedEntity } from '../../entities/provider.Join.need..entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
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
        Receipt,
        NeedReceipt,
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
      NgoPreRegisterEntity
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
export class SyncModule { }
