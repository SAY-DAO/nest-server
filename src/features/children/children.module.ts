import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChildrenEntity, NeedEntity]),
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [ChildrenController],
    providers: [ChildrenService, NeedService],
}) export class ChildrenModule { }
