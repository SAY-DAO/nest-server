import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import {  ContributorEntity } from 'src/entities/user.entity';
import { Colors } from 'src/types/interface';
import { CreateTicketContentParams } from 'src/types/parameters/CreateTicketContentParameters';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private ticketRepository: Repository<TicketEntity>,
    @InjectRepository(TicketContentEntity)
    private ticketContentRepository: Repository<TicketContentEntity>,
    @InjectRepository(TicketViewEntity)
    private ticketViewRepository: Repository<TicketViewEntity>,
  ) { }

  async createTicket(
    ticketDetails: CreateTicketParams,
    participants: ContributorEntity[],
  ): Promise<TicketEntity> {
    const view = await this.createTicketView(ticketDetails.flaskUserId)
    const newTicket = this.ticketRepository.create({
      ...ticketDetails,
      color: Colors.YELLOW, // start with Warning,
    });
    newTicket.contributors = participants
    newTicket.views = [view]
    return this.ticketRepository.save(newTicket);
  }

  createTicketView(
    flaskUserId: number,
  ): Promise<TicketViewEntity> {
    const newView = this.ticketViewRepository.create({
      flaskUserId,
      viewed: new Date()
    });
    return this.ticketViewRepository.save(newView);
  }

  updateTicketColor(
    ticketId: string,
    color: Colors,
  ): Promise<UpdateResult> {
    return this.ticketRepository.update(ticketId, {
      color: color,
    });
  }


  createTicketContent(
    contentDetails: CreateTicketContentParams,
    ticket: TicketEntity
  ): Promise<TicketContentEntity> {
    const newContent = this.ticketContentRepository.create({
      ...contentDetails,
    });
    newContent.ticket = ticket
    return this.ticketContentRepository.save(newContent);
  }

  getTickets(): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      relations: {
        need: true
      }
    });
  }

  getUserTickets(flaskUserId: number): Promise<TicketEntity[]> {
    console.log()
    return this.ticketRepository.find({
      relations: {
        need: true,
      },
      where: {
        contributors: { flaskId: flaskUserId },
      },
    });
  }

  getTicketByNeedId(flaskNeedId: number): Promise<TicketEntity> {
    const ticket = this.ticketRepository.findOne({
      where: {
        flaskNeedId: flaskNeedId,
      },
    });
    return ticket;
  }

  getTicketById(id: string): Promise<TicketEntity> {
    const ticket = this.ticketRepository.findOne({
      where: {
        id: id,
      },
    });
    return ticket;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
