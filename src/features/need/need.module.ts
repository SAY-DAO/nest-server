import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NeedEntity } from '../../entities/need.entity';
import { NeedController } from './need.controller';
import { NeedService } from './need.service';
import { HttpModule } from '@nestjs/axios';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { AllUserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { GetNeedMiddleware } from './middlewares/get-need.middleware';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { NgoService } from '../ngo/ngo.service';
import { StatusEntity } from 'src/entities/status.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { NeedStatusUpdate } from 'src/entities/flaskEntities/NeedStatusUpdate.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NeedFamily } from 'src/entities/flaskEntities/needFamily';
import { FamilyService } from '../family/family.service';
import { SyncService } from '../sync/sync.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusService } from '../status/status.service';
import { LocationService } from '../location/location.service';
import { ProviderService } from '../provider/provider.service';
import { CityEntity } from 'src/entities/city.entity';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        NGO,
        Child,
        Payment,
        NeedStatusUpdate,
        SocialWorker,
        UserFamily,
        NeedFamily,
        Family,
        User,
        Cities,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      VariableEntity,
      NeedEntity,
      StatusEntity,
      ChildrenEntity,
      PaymentEntity,
      ContributorEntity,
      AllUserEntity,
      NgoEntity,
      NgoArrivalEntity,
      EthereumAccountEntity,
      TicketEntity,
      ReceiptEntity,
      CityEntity,
      ProviderEntity,
      ProviderJoinNeedEntity,
    ChildrenPreRegisterEntity
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [NeedController],
  providers: [
    NeedService,
    ChildrenService,
    PaymentService,
    UserService,
    NgoService,
    FamilyService,
    ReceiptService,
    SyncService,
    StatusService,
    LocationService,
    ProviderService,
  ],
})
export class NeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GetNeedMiddleware).forRoutes('needs');
    // .apply(PostNeedMiddleware)
    // .forRoutes({
    //   path: 'needs/add',
    //   method: RequestMethod.POST,
    // });
  }
}
