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
import { UserEntity } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SignatureEntity, NeedEntity, ChildrenEntity, UserEntity])],
  controllers: [SignatureController],
  providers: [SignatureService, NeedService, UserService, ChildrenService],
})
export class SignatureModule { }
