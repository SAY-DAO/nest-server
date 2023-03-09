import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { TicketService } from '../ticket/ticket.service';
import { GateWayService } from './gatway.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SocialWorker
        ], 'flaskPostgres'),
        TypeOrmModule.forFeature([TicketEntity, TicketContentEntity, TicketViewEntity]),
        ScheduleModule.forRoot(),
        HttpModule],
    controllers: [],
    providers: [GateWayService, TicketService],
}) export class GatewayModule { }
