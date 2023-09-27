import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MineService } from './mine.service';
import { MineController } from './mine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from 'src/entities/need.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { MineMiddleWare } from './middleware/middleware.middleware';
import { FamilyService } from '../family/family.service';
import { PaymentEntity } from 'src/entities/payment.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { NeedService } from '../need/need.service';
import { VariableEntity } from 'src/entities/variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, User, Family, UserFamily], 'flaskPostgres'),
    TypeOrmModule.forFeature([NeedEntity, PaymentEntity, VariableEntity]),
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
