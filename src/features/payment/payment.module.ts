import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllUserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { PaymentService } from './payment.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { PaymentController } from './payment.controller';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, SocialWorker, Child], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      PaymentEntity,
      NeedEntity,
      AllUserEntity,
      ContributorEntity,
      ChildrenEntity,
      EthereumAccountEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, UserService, NeedService, ChildrenService],
})
export class PaymentModule { }
