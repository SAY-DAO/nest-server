import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { Colors } from 'src/types/interfaces/interface';
import { CreateTicketContentParams } from 'src/types/parameters/CreateTicketContentParameters';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { Brackets, Repository, UpdateResult, ViewEntity } from 'typeorm';

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
    participants: AllUserEntity[],
  ): Promise<TicketEntity> {
    const newTicket = this.ticketRepository.create({
      ...ticketDetails,
      color: Colors.YELLOW, // start with Warning,
    });

    newTicket.contributors = participants
    return this.ticketRepository.save(newTicket);
  }


  async getTicketById(id: string, flaskUserId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        need: true
      }
    });
    // create or update view
    const view = ticket.views.find((v) => (v.flaskUserId === flaskUserId && v.ticketId === ticket.id))
    if (view) {
      await this.updateTicketView(new Date(), view)
      console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');
    } else {

      await this.createTicketView(flaskUserId, ticket.id)
      console.log('\x1b[36m%s\x1b[0m', 'created my view ...\n');
    }

    return { ticket, view };
  }


  getTicketViewById(id: string): Promise<TicketViewEntity> {
    const view = this.ticketViewRepository.findOne({
      where: {
        id: id,
      },
    });
    return view;
  }

  createTicketView(
    flaskUserId: number,
    ticketId: string,
  ): Promise<TicketViewEntity> {
    const newView = this.ticketViewRepository.create({
      ticketId,
      flaskUserId,
      viewed: new Date()
    });
    return this.ticketViewRepository.save(newView);
  }


  async updateTicketView(
    currentTime: Date,
    view: TicketViewEntity,
  ): Promise<UpdateResult> {
    return this.ticketViewRepository.update(view.id, { viewed: currentTime });
  }


  updateTicketColor(
    ticketId: string,
    color: Colors,
  ): Promise<UpdateResult> {
    return this.ticketRepository.update(ticketId, {
      color: color,
    });
  }

  async updateTicketTime(
    ticket: TicketEntity,
    flaskUserId: number
  ): Promise<Date> {
    const currentTime = new Date()
    await this.ticketRepository.update(ticket.id, {
      updatedAt: currentTime,
    });
    if (flaskUserId) {
      // create or update view
      const view = ticket.views.find((v) => (v.flaskUserId === flaskUserId && v.ticketId === ticket.id))
      if (view) {
        await this.updateTicketView(currentTime, view)
        console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');
      } else {
        await this.createTicketView(flaskUserId, ticket.id)
        console.log('\x1b[36m%s\x1b[0m', 'created my view ...\n');
      }

      return view.updatedAt;
    }


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

  DeleteTicket(id: string) {
    return this.ticketRepository.delete({ id });
  }

  getUserNotifications(flaskUserId: number): Promise<[TicketEntity[], number]> {
    return this.ticketRepository
      .createQueryBuilder('ticketEntity')
      .leftJoinAndSelect("ticketEntity.views", "view")
      .leftJoinAndSelect("ticketEntity.ticketHistories", "ticketHistory")
      .where('ticketEntity.updatedAt > :startDate', {startDate: new Date(2019, 5, 3)})
      .andWhere('view.viewed < ticketEntity.updatedAt')
      // .where(
      //   new Brackets((qb) => {
      //     qb
      //       .where('view.flaskUserId = :flaskUserId', { flaskUserId: flaskUserId })
      //       .andWhere("(ticketEntity.updatedAt) <= (view.viewed)")
      //   }),
      // )
      // .leftJoinAndSelect("ticketEntity.contributors", "contributor")
      // .andWhere('ticketEntity.flaskUserId = :flaskUserId', { flaskUserId: flaskUserId })
      .getManyAndCount()
  }
}
