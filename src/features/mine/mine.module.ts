import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MineService } from './mine.service';
import { MineController } from './mine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { Need } from '../../entities/flaskEntities/need.entity';
import { MineMiddleWare } from './middleware/middleware.middleware';
import { FamilyService } from '../family/family.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { User } from '../../entities/flaskEntities/user.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { NeedService } from '../need/need.service';
import { VariableEntity } from '../../entities/variable.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, User, Family, UserFamily, Receipt, NeedReceipt],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
      PaymentEntity,
      VariableEntity,
      AllUserEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [MineController],
  providers: [MineService, FamilyService, NeedService],
})
export class MineModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MineMiddleWare).forRoutes('mine');
  }
}
