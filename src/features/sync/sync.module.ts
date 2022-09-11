import { Module } from '@nestjs/common';
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
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChildrenEntity, NeedEntity, PaymentEntity, UserEntity]), // add entity and services to be available in the module
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [SyncController],
  providers: [ChildrenService, NeedService, PaymentService, UserService], // add entity and services to be available in the module
})
export class SyncModule { }


