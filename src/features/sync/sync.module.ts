import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { NeedEntity } from '../../entities/need.entity';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, NeedEntity, ChildrenEntity]), // add entitiy and services to be available in the module
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [SyncController],
  providers: [UserService, NeedService, ChildrenService], // add entitiy and services to be available in the module
})
export class SyncModule { }


