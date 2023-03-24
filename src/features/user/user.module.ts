import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import {
  AllUserEntity,
} from '../../entities/user.entity';
import { UserController } from './user.controller';
import { UserMiddleware } from './middlewares/user.middleware';
import { NeedEntity } from '../../entities/need.entity';
import { NeedService } from '../need/need.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { TicketService } from '../ticket/ticket.service';
import { TicketEntity } from 'src/entities/ticket.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SignatureService } from '../wallet/wallet.service';
import { SignatureEntity } from 'src/entities/signature.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, SocialWorker, Child], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      ContributorEntity,
      NeedEntity,
      ChildrenEntity,
      PaymentEntity,
      AllUserEntity,
      SignatureEntity,
      EthereumAccountEntity
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    TicketService,
    NeedService,
    ChildrenService,
    PaymentService,
    SignatureService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users');
  }
}
