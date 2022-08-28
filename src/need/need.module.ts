import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NeedEntity } from '../entities/need.entity';
import { NeedController } from './need.controller';
import { NeedService } from './need.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([NeedEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [NeedController],
  providers: [NeedService],
})
export class NeedModule {}
