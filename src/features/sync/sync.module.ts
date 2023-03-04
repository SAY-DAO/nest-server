import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { NeedEntity } from '../../entities/need.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptEntity } from '../../entities/receipt.entity';
import {
    AllUserEntity,
    ContributorEntity,
    FamilyEntity,
} from 'src/entities/user.entity';
import { SyncService } from './sync.service';
import { NgoService } from '../ngo/ngo.service';
import { NgoEntity } from 'src/entities/ngo.entity';
import { StatusService } from '../status/status.service';
import { StatusEntity } from 'src/entities/status.entity';
import { CityEntity } from 'src/entities/city.entity';
import { CityService } from '../city/city.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ChildrenEntity,
            NgoEntity,
            NeedEntity,
            PaymentEntity,
            ReceiptEntity,
            FamilyEntity,
            ContributorEntity,
            AllUserEntity,
            StatusEntity,
            CityEntity
        ]), // add entity and services to be available in the module
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [],
    providers: [
        CityService,
        SyncService,
        NgoService,
        ChildrenService,
        NeedService,
        PaymentService,
        ReceiptService,
        UserService,
        StatusService,
    ], // add entity and services to be available in the module
})
export class SyncModule { }
