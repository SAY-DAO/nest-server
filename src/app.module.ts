import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import 'reflect-metadata';
import { MileStoneEntity } from './entities/milestone.entity';
import { NeedEntity } from './entities/need.entity';
import { SignatureEntity } from './entities/signature.entity';
import { ChildrenEntity } from './entities/children.entity';
import { FamilyEntity, ContributorEntity } from './entities/user.entity';
import { StepEntity } from './entities/step.entity';
import { ProviderEntity } from './entities/provider.entity';
import { PaymentEntity } from './entities/payment.entity';
import { ReceiptEntity } from './entities/receipt.entity';
import { EthereumAccount } from './entities/ethereum.account.entity';
import { EthereumTransaction } from './entities/ethereum.transaction.entity';
import { NgoEntity } from './entities/ngo.entity';
import { TicketEntity } from './entities/ticket.entity';
import { TicketContentEntity } from './entities/ticketContent.entity';
import { StatusEntity } from './entities/status.entity';
import { CityEntity } from './entities/city.entity';
import { CityModule } from './features/firstDatabase/city/city.module';
import { GatewayModule } from './features/firstDatabase/gateway/gateway.module';
import { TicketViewEntity } from './entities/ticketView.entity';
import { FlaskUserModule } from './features/secondDataBase/user/user.module';
import { SocialWorker } from './entities/flaskEntities/user.entity';
import { StatusModule } from './features/firstDatabase/status/status.module';
import { SyncModule } from './features/firstDatabase/sync/sync.module';
import { UserModule } from './features/firstDatabase/user/user.module';
import { TicketModule } from './features/firstDatabase/ticket/ticket.module';
import { NgoModule } from './features/firstDatabase/ngo/ngo.module';
import { PaymentModule } from './features/firstDatabase/payment/payment.module';
import { ReceiptModule } from './features/firstDatabase/receipt/receipt.module';
import { ProviderModule } from './features/firstDatabase/provider/provider.module';
import { StepModule } from './features/firstDatabase/step/step.module';
import { ChildrenModule } from './features/firstDatabase/children/children.module';
import { NeedModule } from './features/firstDatabase/need/need.module';
import { MilestoneModule } from './features/firstDatabase/milestone/milestone.module';
import { SignatureModule } from './features/firstDatabase/signature/signature.module';

const imports = [
  LoggerModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    ...config().db1,
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
      EthereumTransaction,
    ],
  }),
  TypeOrmModule.forRoot({
    ...config().db2,
    entities: [SocialWorker],
  }),
  FlaskUserModule,
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
