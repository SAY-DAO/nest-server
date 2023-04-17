import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { TicketMiddleware } from './middlewares/ticket.middleware';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { SyncService } from '../sync/sync.service';
import { NgoService } from '../ngo/ngo.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from 'src/entities/payment.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from 'src/entities/status.entity';
import { CityEntity } from 'src/entities/city.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { SocialWorker } from '../../entities/flaskEntities/user.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { LocationService } from '../location/location.service';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { ProviderService } from '../provider/provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, SocialWorker, NGO, Cities, Child, Payment],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      CityEntity,
      AllUserEntity,
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      NeedEntity,
      NgoEntity,
      NgoArrivalEntity,
      ContributorEntity,
      ChildrenEntity,
      ReceiptEntity,
      PaymentEntity,
      StatusEntity,
      EthereumAccountEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
    ]),
  ],
  controllers: [TicketController],
  providers: [
    LocationService,
    PaymentService,
    ReceiptService,
    TicketService,
    NeedService,
    SyncService,
    NgoService,
    UserService,
    ChildrenService,
    StatusService,
    ProviderService
  ],
})
export class TicketModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TicketMiddleware).forRoutes('tickets');
  }
}
