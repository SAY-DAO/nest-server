import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from './wallet.controller';
import { SignatureEntity } from '../../entities/signature.entity';
import { SignatureService } from './wallet.service';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { SignatureMiddleware } from './middlewares/wallet.middleware';
import { EthersModule } from 'nestjs-ethers';
import { NgoService } from '../ngo/ngo.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { SyncService } from '../sync/sync.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { StatusService } from '../status/status.service';
import { CityEntity } from 'src/entities/city.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { IpfsService } from '../ipfs/ipfs.service';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { LocationService } from '../location/location.service';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { ProviderService } from '../provider/provider.service';
import { ProviderEntity } from 'src/entities/provider.entity';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { DownloadService } from '../download/download.service';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    EthersModule.forRoot({
      network: 'sepolia',
      alchemy: process.env.ALCHEMY_KEY_SEPOLIA,
      cloudflare: true,
      //  * Optional parameter the number of backends that must agree. default: 2 for mainnet, 1 for testnets)
      quorum: 1,
      useDefaultProvider: true,
    }),
    TypeOrmModule.forFeature(
      [
        SocialWorker,
        Need,
        NGO,
        Cities,
        Child,
        Payment,
        UserFamily,
        Family,
        User,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      PaymentEntity,
      SignatureEntity,
      NeedEntity,
      ChildrenEntity,
      ContributorEntity,
      AllUserEntity,
      NgoEntity,
      NgoArrivalEntity,
      ReceiptEntity,
      StatusEntity,
      CityEntity,
      IpfsEntity,
      EthereumAccountEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
    ]),
  ],
  controllers: [SignatureController],
  providers: [
    LocationService,
    SignatureService,
    NeedService,
    PaymentService,
    UserService,
    ChildrenService,
    NgoService,
    SyncService,
    ReceiptService,
    StatusService,
    IpfsService,
    ProviderService,
    DownloadService,
  ],
})
export class WalletModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SignatureMiddleware).forRoutes('signatures');
  }
}
