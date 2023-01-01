import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import 'reflect-metadata';
import { MileStoneEntity } from './entities/milestone.entity';
import { NeedEntity } from './entities/need.entity';
import { SignatureModule } from './features/signature/signature.module';
import { SignatureEntity } from './entities/signature.entity';
import { ChildrenEntity } from './entities/children.entity';
import { FamilyEntity, SocialWorkerEntity } from './entities/user.entity';
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
import { ReceiptEntity } from './entities/receipt.entity';
import { ReceiptModule } from './features/receipt/receipt.module';
import { EthereumAccount } from './entities/ethereum.account.entity';
import { EthereumTransaction } from './entities/ethereum.transaction.entity';
import { NgoModule } from './features/ngo/ngo.module';
import { NgoEntity } from './entities/ngo.entity';
import { AuthenticationModule } from './features/authentication/auth.module';

const imports = [
  LoggerModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    ...config().db,
    dropSchema: false,
    entities: [
      FamilyEntity,
      SocialWorkerEntity,
      NgoEntity,
      PaymentEntity,
      ReceiptEntity,
      NeedEntity,
      ProviderEntity,
      MileStoneEntity,
      StepEntity,
      SignatureEntity,
      ChildrenEntity,
      EthereumAccount,
      EthereumTransaction
    ],
  }),
  AuthenticationModule,
  SyncModule,
  UserModule,
  NgoModule,
  PaymentModule,
  ReceiptModule,
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
