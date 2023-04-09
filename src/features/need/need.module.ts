import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { PostNeedMiddleware } from './middlewares/post-need.middleware';
import { NgoEntity } from '../../entities/ngo.entity';
import { NgoService } from '../ngo/ngo.service';
import { StatusEntity } from 'src/entities/status.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { NeedStatusUpdate } from 'src/entities/flaskEntities/NeedStatusUpdate.entity';
import { TicketEntity } from 'src/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, SocialWorker, NGO, Child, Payment, NeedStatusUpdate, SocialWorker],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
      StatusEntity,
      ChildrenEntity,
      PaymentEntity,
      ContributorEntity,
      AllUserEntity,
      NgoEntity,
      EthereumAccountEntity,
      TicketEntity
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
  ],
})
export class NeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GetNeedMiddleware)
      .forRoutes({
        path: 'needs/all',
        method: RequestMethod.GET,
      })
      .apply(PostNeedMiddleware)
      .forRoutes({
        path: 'needs/add',
        method: RequestMethod.POST,
      });
  }
}
