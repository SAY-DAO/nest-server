import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from './signature.controller';
import { SignatureEntity } from '../../entities/signature.entity';
import { SignatureService } from './signature.service';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { FamilyEntity, SocialWorkerEntity } from '../../entities/user.entity';
import { PaymentService } from '../payment/payment.service';
import { PaymentEntity } from '../../entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, SignatureEntity, NeedEntity, ChildrenEntity, FamilyEntity, SocialWorkerEntity])],
  controllers: [SignatureController],
  providers: [SignatureService, NeedService, PaymentService, UserService, ChildrenService],
})
export class SignatureModule { }
