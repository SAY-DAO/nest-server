import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { WalletService } from '../wallet/wallet.service';
import { SignatureEntity } from 'src/entities/signature.entity';
import { FamilyService } from '../family/family.service';
import { MineService } from '../mine/mine.service';
import { PaymentEntity } from 'src/entities/payment.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { CampaignEntity } from 'src/entities/campaign.entity';
import { CampaignController } from './campaign.controller';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';
import { UrlEntity } from 'src/entities/url.entity';
import { CampaignMiddleware } from './middlewares/campaign.middleware';
import { SyncService } from '../sync/sync.service';
import { NgoService } from '../ngo/ngo.service';
import { ReceiptService } from '../receipt/receipt.service';
import { PaymentService } from '../payment/payment.service';
import { StatusService } from '../status/status.service';
import { ProviderService } from '../provider/provider.service';
import { LocationService } from '../location/location.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { ProviderEntity } from 'src/entities/provider.entity';
import { LocationEntity } from 'src/entities/location.entity';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { Countries } from 'src/entities/flaskEntities/countries.entity';

@Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: config.get('MAIL_HOST'),
          secure: true,
          auth: {
            user: config.get('MAIL_FROM'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(
      [
        SocialWorker,
        User,
        Need,
        Child,
        Family,
        UserFamily,
        Receipt,
        NeedReceipt,
        NGO,
        Payment,
        Cities,
        Countries,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
      VariableEntity,
      ChildrenEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity,
      SignatureEntity,
      PaymentEntity,
      AllUserEntity,
      CampaignEntity,
      UrlEntity,
      NgoEntity,
      NgoArrivalEntity,
      ReceiptEntity,
      PaymentEntity,
      StatusEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
      LocationEntity,
    ]),
  ],
  providers: [
    CampaignService,
    UserService,
    NeedService,
    ChildrenService,
    WalletService,
    FamilyService,
    MineService,
    SyncService,
    NgoService,
    ReceiptService,
    PaymentService,
    StatusService,
    ProviderService,
    LocationService,
  ],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CampaignMiddleware)
      .exclude('campaign/:code')
      .forRoutes('campaign');
  }
}
