import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import {
  AllUserEntity,
  ContributorEntity,
  FamilyEntity,
} from 'src/entities/user.entity';
import { TicketMiddleware } from './middlewares/ticket.middleware';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { SyncService } from '../sync/sync.service';
import { NgoService } from '../ngo/ngo.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NgoEntity } from 'src/entities/ngo.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from 'src/entities/payment.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from 'src/entities/status.entity';
import { CityService } from '../city/city.service';
import { CityEntity } from 'src/entities/city.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { SocialWorker } from '../../../entities/flaskEntities/user.entity';
import { FlaskUserService } from 'src/features/secondDataBase/user/user.service';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      SocialWorker
    ], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      CityEntity,
      AllUserEntity,
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      NeedEntity,
      NgoEntity,
      FamilyEntity,
      ContributorEntity,
      ChildrenEntity,
      ReceiptEntity,
      PaymentEntity,
      StatusEntity,
    ]),
  ],
  controllers: [TicketController],
  providers: [
    CityService,
    PaymentService,
    ReceiptService,
    TicketService,
    NeedService,
    SyncService,
    NgoService,
    UserService,
    ChildrenService,
    StatusService,
    FlaskUserService
  ],
})
export class TicketModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TicketMiddleware).forRoutes('tickets');
  }
}
