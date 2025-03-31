import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { IpfsController } from './ipfs.controller';
import { HttpModule } from '@nestjs/axios';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from '../../entities/flaskEntities/need.entity';
import { IpfsEntity } from '../../entities/ipfs.entity';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { DownloadService } from '../download/download.service';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { Family } from '../../entities/flaskEntities/family.entity';
import { IpfsMiddleware } from './middlewares/ipfs.middleware';
import { VariableEntity } from '../../entities/variable.entity';
import { ChildrenPreRegisterEntity } from '../../entities/childrenPreRegister.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        Child,
        Payment,
        SocialWorker,
        UserFamily,
        Family,
        User,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      VariableEntity,
      NeedEntity,
      IpfsEntity,
      ChildrenEntity,
      PaymentEntity,
      ChildrenPreRegisterEntity,
    ]),
    HttpModule,
  ],
  controllers: [IpfsController],
  providers: [
    IpfsService,
    ChildrenService,
    NeedService,
    PaymentService,
    DownloadService,
  ],
})
export class IpfsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpfsMiddleware).forRoutes('ipfs');
  }
}
