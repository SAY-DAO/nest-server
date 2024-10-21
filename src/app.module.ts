import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import 'reflect-metadata';
import { LocationModule } from './features/location/location.module';
import { GatewayModule } from './features/gateway/gateway.module';
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
import { Need } from './entities/flaskEntities/need.entity';
import { IpfsModule } from './features/ipfs/ipfs.module';
import { NGO } from './entities/flaskEntities/ngo.entity';
import { Cities } from './entities/flaskEntities/cities.entity';
import { Child } from './entities/flaskEntities/child.entity';
import { HttpModule } from '@nestjs/axios';
import { Payment } from './entities/flaskEntities/payment.entity';
import { AnalyticModule } from './features/analytic/analytic.module';
import { Family } from './entities/flaskEntities/family.entity';
import { NeedStatusUpdate } from './entities/flaskEntities/NeedStatusUpdate.entity';
import { NeedReceipt } from './entities/flaskEntities/needReceipt.entity';
import { Receipt } from './entities/flaskEntities/receipt.entity';
import { DownloadModule } from './features/download/download.module';
import { NeedFamily } from './entities/flaskEntities/needFamily';
import { ScheduleTaskModule } from './features/schedule/schedule.module';
import { FamilyModule } from './features/family/family.module';
import { MidjourneyModule } from './features/midjourney/midjourney.module';
import { CommentModule } from './features/comment/comment.module';
import { MineModule } from './features/mine/mine.module';
import { ContributionModule } from './features/contribution/contribution.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { postgresDataSourceOptions } from './db/data-source';
import { CampaignModule } from './features/campaign/campaign.module';
import { Countries } from './entities/flaskEntities/countries.entity';

const imports = [
  ThrottlerModule.forRoot({
    ttl: 60, // time to live,
    limit: 10, // the maximum number of requests within the ttl
  }),

  HttpModule,
  ScheduleModule.forRoot(),
  LoggerModule.forRoot(),
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot(postgresDataSourceOptions),
  TypeOrmModule.forRoot({
    ...config().db2,
    entities: [
      Countries,
      Need,
      SocialWorker,
      NGO,
      Cities,
      Child,
      Payment,
      Family,
      NeedFamily,
      NeedStatusUpdate,
      Receipt,
      NeedReceipt,
    ],
  }),
  // MulterModule.register({
  //   dest: '../../midjourney',
  // }),
  // ServeStaticModule.forRoot({
  //   rootPath: join(__dirname, '..', 'files'),
  // }),
  CampaignModule,
  ScheduleTaskModule,
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
  AnalyticModule,
  DownloadModule,
  FamilyModule,
  MidjourneyModule,
  CommentModule,
  MineModule,
  ContributionModule,
  CampaignModule,
];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule {}
