import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { NeedEntity } from '../../entities/need.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { FamilyEntity, SocialWorkerEntity } from '../../entities/user.entity';
import { SyncMiddleware } from './middlewares/sync.middleware';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { NgoEntity } from '../../entities/ngo.entity';
import { NgoService } from '../ngo/ngo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChildrenEntity, NeedEntity, PaymentEntity, ReceiptEntity, FamilyEntity, SocialWorkerEntity, NgoEntity]), // add entity and services to be available in the module
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [SyncController],
  providers: [ChildrenService, NeedService, PaymentService, ReceiptService, UserService, NgoService], // add entity and services to be available in the module
})
export class SyncModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SyncMiddleware).forRoutes({
      path: 'sync/update',
      method: RequestMethod.POST
    })
  }
}
