import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { NeedService } from '../need/need.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from '../../entities/flaskEntities/child.entity';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { FamilyService } from '../family/family.service';
import { Family } from '../../entities/flaskEntities/family.entity';
import { AnalyticService } from '../analytic/analytic.service';
import { NGO } from '../../entities/flaskEntities/ngo.entity';
import { Payment } from '../../entities/flaskEntities/payment.entity';
import { UserFamily } from '../../entities/flaskEntities/userFamily.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';
import { NgoService } from '../ngo/ngo.service';
import { UserService } from '../user/user.service';
import { NgoArrivalEntity, NgoEntity } from '../../entities/ngo.entity';
import { ContributorEntity } from '../../entities/contributor.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { NgoPreRegisterEntity } from 'src/entities/ngoPreRegister.entity';

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
      EthereumAccountEntity,
      NgoPreRegisterEntity
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
