import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { AllUserEntity, ContributorEntity } from 'src/entities/user.entity';
import { CreateTicketContentParams } from 'src/types/parameters/CreateTicketContentParameters';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { UpdateTicketParams } from 'src/types/parameters/UpdateTicketParameters';
import { Repository } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private ticketRepository: Repository<TicketEntity>,
    @InjectRepository(TicketContentEntity)
    private ticketContentRepository: Repository<TicketContentEntity>,
  ) { }

  createTicket(
    ticketDetails: CreateTicketParams,
    participants: ContributorEntity[],
  ): Promise<TicketEntity> {
    const newTicket = this.ticketRepository.create({
      ...ticketDetails,
    });
    newTicket.contributors = participants
    return this.ticketRepository.save(newTicket);
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
        flaskUserId: flaskUserId,
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

  update(id: number, updateTicketDto: UpdateTicketParams) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
