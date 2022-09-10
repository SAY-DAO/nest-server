import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { MileStoneEntity } from './entities/milestone.entity';
import { NeedEntity } from './entities/need.entity';
import { SignatureModule } from './features/signature/signature.module';
import { SignatureEntity } from './entities/signature.entity';
import { ChildrenEntity } from './entities/children.entity';
import { UserEntity } from './entities/user.entity';
import { SyncModule } from './features/sync/sync.module';
import { ChildrenModule } from './features/children/children.module';
import { NeedModule } from './features/need/need.module';
import { MilestoneModule } from './features/milestone/milestone.module';
import { StepEntity } from './entities/step.entity';
import { UserModule } from './features/user/user.module';
import { StepModule } from './features/step/step.module';
import { ProviderModule } from './features/provider/provider.module';
import { ProviderEntity } from './entities/provider.entity';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentModule } from './features/payment/payment.module';

const imports = [
  LoggerModule.forRoot(),
  TypeOrmModule.forRoot({
    ...config().db,
    dropSchema: false,
    entities: [
      UserEntity,
      PaymentEntity,
      NeedEntity,
      ProviderEntity,
      MileStoneEntity,
      StepEntity,
      SignatureEntity,
      ChildrenEntity,
    ],
  }),
  SyncModule,
  UserModule,
  PaymentModule,
  ChildrenModule,
  NeedModule,
  ProviderModule,
  MilestoneModule,
  StepModule,
  SignatureModule,
  ScheduleModule.forRoot(),
];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule { }
