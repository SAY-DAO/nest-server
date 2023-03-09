import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { StepEntity } from '../../../entities/step.entity';
import { StepService } from './step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StepEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [],
  providers: [
    StepService,
  ],
})
export class StepModule { }
