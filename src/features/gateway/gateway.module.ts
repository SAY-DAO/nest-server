import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { GateWayController } from './gatway.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SocialWorker,
            Need
        ], 'flaskPostgres'),
        TypeOrmModule.forFeature([TicketEntity, TicketContentEntity, TicketViewEntity, ContributorEntity, AllUserEntity, EthereumAccountEntity, NeedEntity]),
        ScheduleModule.forRoot(),
        HttpModule],
    controllers: [],
    providers: [GateWayController, TicketService, UserService],
}) export class GatewayModule { }
