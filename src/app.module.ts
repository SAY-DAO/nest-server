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
import { StepEntity } from './entities/step.entity';
import { ProviderEntity } from './entities/provider.entity';
import { PaymentEntity } from './entities/payment.entity';
import { ReceiptEntity } from './entities/receipt.entity';
import { EthereumAccountEntity } from './entities/ethereum.account.entity';
import { EthereumTransaction } from './entities/ethereum.transaction.entity';
import { NgoEntity } from './entities/ngo.entity';
import { TicketEntity } from './entities/ticket.entity';
import { TicketContentEntity } from './entities/ticketContent.entity';
import { StatusEntity } from './entities/status.entity';
import { CityEntity } from './entities/city.entity';
import { LocationModule } from './features/location/location.module';
import { GatewayModule } from './features/gateway/gateway.module';
import { TicketViewEntity } from './entities/ticketView.entity';
import { SocialWorker } from './entities/flaskEntities/user.entity';
import { StatusModule } from './features/status/status.module';
import { SyncModule } from './features/sync/sync.module';
import { UserModule } from './features/user/user.module';
import { TicketModule } from './features/ticket/ticket.module';
import { NgoModule } from './features/ngo/ngo.module';
import { PaymentModule } from './features/payment/payment.module';
import { ReceiptModule } from './features/receipt/receipt.module';
import { ProviderModule } from './features/provider/provider.module';
import { StepModule } from './features/step/step.module';
import { ChildrenModule } from './features/children/children.module';
import { NeedModule } from './features/need/need.module';
import { MilestoneModule } from './features/milestone/milestone.module';
import { WalletModule } from './features/wallet/wallet.module';
import { Session } from './entities/session.entity';
import { Need } from './entities/flaskEntities/need.entity';
import { IpfsModule } from './features/ipfs/ipfs.module';
import {
  IpfsChildEntity,
  IpfsEntity,
  IpfsNeedEntity,
} from 'src/entities/ipfs.entity';
import { NGO } from './entities/flaskEntities/ngo.entity';
import { Cities } from './entities/flaskEntities/cities.entity';
import { ContributorEntity } from './entities/contributor.entity';
import { Child } from './entities/flaskEntities/child.entity';
import { HttpModule } from '@nestjs/axios';

const imports = [
  HttpModule,
  ScheduleModule.forRoot(),
  LoggerModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    ...config().db1,
    entities: [
      Session,
      CityEntity,
      StatusEntity,
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
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
      EthereumAccountEntity,
      EthereumTransaction,
      IpfsChildEntity,
      IpfsEntity,
      IpfsNeedEntity,
    ],
  }),
  TypeOrmModule.forRoot({
    ...config().db2,
    entities: [Need, SocialWorker, NGO, Cities, Child],
  }),
  GatewayModule,
  LocationModule,
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
  WalletModule,
  IpfsModule,

];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule { }
