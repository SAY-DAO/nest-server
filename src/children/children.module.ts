import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenEntity } from '../entities/children.entity';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChildrenEntity]),
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [ChildrenController],
    providers: [ChildrenService],
}) export class ChildrenModule { }
