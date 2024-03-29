import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { NeedService } from '../need/need.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { FamilyService } from '../family/family.service';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { AnalyticService } from '../analytic/analytic.service';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from 'src/entities/payment.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';
import { NgoService } from '../ngo/ngo.service';
import { UserService } from '../user/user.service';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        SocialWorker,
        Child,
        User,
        Family,
        NGO,
        Payment,
        UserFamily,
        Receipt,
        NeedReceipt,
      ],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
      VariableEntity,
      PaymentEntity,
      NgoEntity,
      NgoArrivalEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity
    ]),
  ],
  controllers: [],
  providers: [
    NeedService,
    FamilyService,
    AnalyticService,
    NgoService,
    UserService,
    ScheduleService,
  ],
})
export class ScheduleTaskModule {}
