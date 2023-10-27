import { HttpModule } from '@nestjs/axios';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { NgoEntity } from '../../entities/ngo.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { ChildrenMiddleware } from './middlewares/children.middleware';
import { VariableEntity } from 'src/entities/variable.entity';
import { UserService } from '../user/user.service';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { LocationService } from '../location/location.service';
import { LocationEntity } from 'src/entities/location.entity';
import { Cities } from 'src/entities/flaskEntities/cities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, Child, Payment, SocialWorker, UserFamily, Family, User, Cities],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ChildrenEntity,
      NeedEntity,
      VariableEntity,
      NgoEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity,
      LocationEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [ChildrenController],
  providers: [
    ChildrenService,
    NeedService,
    ChildrenService,
    UserService,
    LocationService,
  ],
})
export class ChildrenModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ChildrenMiddleware)
      .exclude(
        { path: 'children/images/:fileName', method: RequestMethod.GET },
        { path: 'children/voices/:fileName', method: RequestMethod.GET },
      )
      .forRoutes(ChildrenController);
  }
}
