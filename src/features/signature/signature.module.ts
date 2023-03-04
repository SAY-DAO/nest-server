import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from './signature.controller';
import { SignatureEntity } from '../../entities/signature.entity';
import { SignatureService } from './signature.service';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { FamilyEntity, ContributorEntity, AllUserEntity } from '../../entities/user.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { SignatureMiddleware } from './middlewares/signature.middleware';
import { EthersModule, GOERLI_NETWORK } from 'nestjs-ethers';
import { NgoService } from '../ngo/ngo.service';
import { NgoEntity } from 'src/entities/ngo.entity';
import { SyncService } from '../sync/sync.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from 'src/entities/receipt.entity';
import { StatusEntity } from 'src/entities/status.entity';
import { StatusService } from '../status/status.service';
import { CityService } from '../city/city.service';
import { CityEntity } from 'src/entities/city.entity';

@Module({
  imports: [
    EthersModule.forRoot({
      network: GOERLI_NETWORK,
      alchemy: process.env.ALCHEMY_KEY,
      cloudflare: true,
      //  * Optional parameter the number of backends that must agree. default: 2 for mainnet, 1 for testnets)
      quorum: 1,
      useDefaultProvider: true,
    }),
    TypeOrmModule.forFeature([
      PaymentEntity,
      SignatureEntity,
      NeedEntity,
      ChildrenEntity,
      FamilyEntity,
      ContributorEntity,
      AllUserEntity,
      NgoEntity,
      ReceiptEntity,
      StatusEntity,
      CityEntity
    ]),
  ],
  controllers: [SignatureController],
  providers: [
    CityService,
    SignatureService,
    NeedService,
    PaymentService,
    UserService,
    ChildrenService,
    NgoService,
    SyncService,
    ReceiptService,
    StatusService
  ],
})
export class SignatureModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SignatureMiddleware).forRoutes('signatures');
  }
}
