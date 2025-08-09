import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from '../../entities/ticket.entity';
import { TicketContentEntity } from '../../entities/ticketContent.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { TicketMiddleware } from './middlewares/ticket.middleware';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';
import { SyncService } from '../sync/sync.service';
import { NgoService } from '../ngo/ngo.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from '../../entities/status.entity';
import { LocationEntity } from '../../entities/location.entity';
import { TicketViewEntity } from '../../entities/ticketView.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { LocationService } from '../location/location.service';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderJoinNeedEntity } from '../../entities/provider.Join.need..entity';
import { ProviderService } from '../provider/provider.service';
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
      NgoPreRegisterEntity
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
