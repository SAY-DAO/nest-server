import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, Child, Payment, SocialWorker, UserFamily, Family, User],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ChildrenEntity,
      NeedEntity,
      VariableEntity,
      NgoEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService, NeedService, ChildrenService],
})
export class ChildrenModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ChildrenMiddleware).forRoutes('children');
  }
}
