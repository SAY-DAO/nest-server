import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { NeedMiddleware } from './middlewares/need.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([NeedEntity, ChildrenEntity, PaymentEntity, UserEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [NeedController],
  providers: [NeedService, ChildrenService, PaymentService, UserService],
})
export class NeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NeedMiddleware).forRoutes('needs')
  }
}