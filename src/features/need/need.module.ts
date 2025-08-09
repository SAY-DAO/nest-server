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
import { StatusEntity } from '../../entities/status.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { NeedStatusUpdate } from '../../entities/flaskEntities/NeedStatusUpdate.entity';
import { TicketEntity } from '../../entities/ticket.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { NeedFamily } from '../../entities/flaskEntities/needFamily';
import { FamilyService } from '../family/family.service';
import { SyncService } from '../sync/sync.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { StatusService } from '../status/status.service';
import { LocationService } from '../location/location.service';
import { ProviderService } from '../provider/provider.service';
import { LocationEntity } from '../../entities/location.entity';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderJoinNeedEntity } from '../../entities/provider.Join.need..entity';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Countries } from '../../entities/flaskEntities/countries.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { TicketService } from '../ticket/ticket.service';
import { TicketContentEntity } from '../../entities/ticketContent.entity';
import { TicketViewEntity } from '../../entities/ticketView.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';

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
        Countries,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      VariableEntity,
      NeedEntity,
      TicketEntity,
      TicketContentEntity,
      TicketViewEntity,
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
      LocationEntity,
      ProviderEntity,
      ProviderJoinNeedEntity,
      ChildrenPreRegisterEntity,
      NgoPreRegisterEntity
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
    TicketService,
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
