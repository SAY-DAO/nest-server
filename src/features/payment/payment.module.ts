import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { PaymentService } from './payment.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';
import { PaymentController } from './payment.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity, UserEntity, NeedEntity, ChildrenEntity])],
    controllers: [PaymentController],
    providers: [PaymentService, UserService, NeedService, ChildrenService],
})

export class PaymentModule { }
