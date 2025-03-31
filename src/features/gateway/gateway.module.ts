import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { TicketEntity } from '../../entities/ticket.entity';
import { TicketContentEntity } from '../../entities/ticketContent.entity';
import { TicketViewEntity } from '../../entities/ticketView.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { GateWayController } from './gatway.controller';
import { GateWayMiddleware } from './middlewares/gateway.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialWorker, Need, User], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketContentEntity,
      TicketViewEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      NeedEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [],
  providers: [GateWayController, TicketService, UserService],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GateWayMiddleware).forRoutes('gateway');
  }
}
