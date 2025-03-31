import { TypeOrmModule } from '@nestjs/typeorm';
import { AllUserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { Countries } from '../../entities/flaskEntities/countries.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { NeedFamily } from '../../entities/flaskEntities/needFamily';
import { NeedStatusUpdate } from '../../entities/flaskEntities/NeedStatusUpdate.entity';
import { CampaignModule } from '../campaign/campaign.module';
import { ScheduleTaskModule } from '../schedule/schedule.module';
import { GatewayModule } from '../gateway/gateway.module';
import { LocationModule } from '../location/location.module';
import { StatusModule } from '../status/status.module';
import { SyncModule } from '../sync/sync.module';
import { UserModule } from '../user/user.module';
import { TicketModule } from '../ticket/ticket.module';
import { NgoModule } from '../ngo/ngo.module';
import { PaymentModule } from '../payment/payment.module';
import { ReceiptModule } from '../receipt/receipt.module';
import { ChildrenModule } from '../children/children.module';
import { NeedModule } from '../need/need.module';
import { ProviderModule } from '../provider/provider.module';
import { MilestoneModule } from '../milestone/milestone.module';
import { StepModule } from '../step/step.module';
import { WalletModule } from '../wallet/wallet.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { AnalyticModule } from '../analytic/analytic.module';
import { DownloadModule } from '../download/download.module';
import { FamilyModule } from './family.module';
import { MidjourneyModule } from '../midjourney/midjourney.module';
import { CommentModule } from '../comment/comment.module';
import { MineModule } from '../mine/mine.module';
import { ContributionModule } from '../contribution/contribution.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { postgresDataSourceOptions } from '../../db/data-source';
import config from '../../config';

export const TypeOrmSQLITETestingModule = () => [
  ThrottlerModule.forRoot({
    ttl: 60, // time to live,
    limit: 10, // the maximum number of requests within the ttl
  }),

  // HttpModule,
  // ScheduleModule.forRoot(),
  // LoggerModule.forRoot(),
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

