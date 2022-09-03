import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NeedEntity } from '../entities/need.entity';
import { NeedController } from './need.controller';
import { NeedService } from './need.service';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../user/user.service';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NeedEntity, UserEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [NeedController],
  providers: [NeedService, UserService],
})
export class NeedModule { }
