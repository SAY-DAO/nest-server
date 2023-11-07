import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { IpfsController } from './ipfs.controller';
import { HttpModule } from '@nestjs/axios';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from 'src/entities/children.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from 'src/entities/payment.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { DownloadService } from '../download/download.service';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { IpfsMiddleware } from './middlewares/ipfs.middleware';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

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
