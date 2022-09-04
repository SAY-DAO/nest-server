import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { EpicService } from './epic.service';
import { EpicEntity } from '../../entities/epic.enitity';
import { EpicController } from './epic.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([EpicEntity]),
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [EpicController],
    providers: [EpicService],
})
export class EpicModule { }
