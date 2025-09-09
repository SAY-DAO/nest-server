import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { AllUserEntity } from '../../entities/user.entity';
import { UserController } from './user.controller';
import { UserMiddleware } from './middlewares/user.middleware';
import { NeedEntity } from '../../entities/need.entity';
import { NeedService } from '../need/need.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { TicketService } from '../ticket/ticket.service';
import { TicketEntity } from '../../entities/ticket.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { TicketContentEntity } from '../../entities/ticketContent.entity';
import { TicketViewEntity } from '../../entities/ticketView.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { WalletService } from '../wallet/wallet.service';
import { SignatureEntity } from '../../entities/signature.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { IpfsService } from '../ipfs/ipfs.service';
import { IpfsEntity } from '../../entities/ipfs.entity';
import { NgoService } from '../ngo/ngo.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { DownloadService } from '../download/download.service';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';
import { CheckPointService } from '../checkpoint/checkpoint.service';
import { CheckPointEntity } from 'src/entities/checkpoint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        Child,
        Payment,
        NGO,
        UserFamily,
        Family,
        User,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketViewEntity,
      TicketContentEntity,
      ContributorEntity,
      VariableEntity,
      NeedEntity,
      ChildrenEntity,
      PaymentEntity,
      AllUserEntity,
      SignatureEntity,
      EthereumAccountEntity,
      IpfsEntity,
      NgoEntity,
      NgoArrivalEntity,
      ChildrenPreRegisterEntity,
      NgoPreRegisterEntity,
      CheckPointEntity,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    TicketService,
    NeedService,
    ChildrenService,
    PaymentService,
    WalletService,
    IpfsService,
    NgoService,
    DownloadService,
    CheckPointService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users');
  }
}
