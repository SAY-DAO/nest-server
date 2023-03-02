import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import {
  FamilyEntity,
  ContributorEntity,
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketContentEntity,
      FamilyEntity,
      ContributorEntity,
      NeedEntity,
      ChildrenEntity,
      PaymentEntity,
      AllUserEntity,
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
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users');
  }
}
