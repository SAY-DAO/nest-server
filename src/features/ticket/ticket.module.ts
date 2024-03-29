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
import { LocationEntity } from 'src/entities/location.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
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
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Countries } from 'src/entities/flaskEntities/countries.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        NGO,
        Cities,
        Child,
        Payment,
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
      LocationEntity,
      AllUserEntity,
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      NeedEntity,
      VariableEntity,
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
      ChildrenPreRegisterEntity,
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
    ProviderService,
  ],
})
export class TicketModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TicketMiddleware).forRoutes('tickets');
  }
}
