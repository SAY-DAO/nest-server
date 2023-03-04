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
import { FamilyEntity, ContributorEntity } from './entities/user.entity';
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
import { TicketModule } from './features/ticket/ticket.module';
import { TicketEntity } from './entities/ticket.entity';
import { TicketContentEntity } from './entities/ticketContent.entity';
import { SyncModule } from './features/sync/sync.module';
import { StatusModule } from './features/status/status.module';
import { StatusEntity } from './entities/status.entity';
import { CityEntity } from './entities/city.entity';
import { CityModule } from './features/city/city.module';
import { GatewayModule } from './features/gateway/gateway.module';
import { TicketViewEntity } from './entities/ticketView.entity';

const imports = [
  LoggerModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    ...config().db1,
    ...config().db2,
    dropSchema: false,
    entities: [
      CityEntity,
      StatusEntity,
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      FamilyEntity,
      ContributorEntity,
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
  GatewayModule,
  CityModule,
  StatusModule,
  SyncModule,
  UserModule,
  TicketModule,
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
