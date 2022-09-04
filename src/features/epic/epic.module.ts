import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';
import { EpicService } from './epic.service';
import { EpicEntity } from '../../entities/epic.entity';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { MilestoneService } from '../milestone/milestone.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([EpicEntity, MileStoneEntity, ChildrenEntity, NeedEntity, UserEntity]),
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [],
    providers: [EpicService, MilestoneService, ChildrenService, NeedService, UserService],


})
export class EpicModule { }
