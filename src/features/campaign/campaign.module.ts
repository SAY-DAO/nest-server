import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorEntity } from '../../entities/contributor.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { Need } from '../../entities/flaskEntities/need.entity';
import { NeedEntity } from '../../entities/need.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { WalletService } from '../wallet/wallet.service';
import { SignatureEntity } from '../../entities/signature.entity';
import { FamilyService } from '../family/family.service';
import { MineService } from '../mine/mine.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { CampaignEntity } from '../../entities/campaign.entity';
import { CampaignController } from './campaign.controller';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { UrlEntity } from '../../entities/url.entity';
import { CampaignMiddleware } from './middlewares/campaign.middleware';
import { SyncService } from '../sync/sync.service';
import { NgoService } from '../ngo/ngo.service';
import { ReceiptService } from '../receipt/receipt.service';
import { PaymentService } from '../payment/payment.service';
import { StatusService } from '../status/status.service';
import { ProviderService } from '../provider/provider.service';
import { LocationService } from '../location/location.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { StatusEntity } from '../../entities/status.entity';
import { ProviderJoinNeedEntity } from '../../entities/provider.Join.need..entity';
import { ProviderEntity } from '../../entities/provider.entity';
import { LocationEntity } from '../../entities/location.entity';
import { Cities } from '../../entities/flaskEntities/cities.entity';
import { Countries } from '../../entities/flaskEntities/countries.entity';
import { TicketService } from '../ticket/ticket.service';
import { TicketViewEntity } from '../../entities/ticketView.entity';
import { TicketEntity } from '../../entities/ticket.entity';
import { TicketContentEntity } from '../../entities/ticketContent.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';
// import { VisitorEntity } from 'src/entities/visitor.entity';

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
          secure: false,
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
      // VisitorEntity,
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
      TicketViewEntity,
      TicketEntity,
      TicketContentEntity,
      NgoPreRegisterEntity,
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
    TicketService,
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
