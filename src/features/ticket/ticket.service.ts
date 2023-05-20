import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import { TicketContentEntity } from 'src/entities/ticketContent.entity';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { AnnouncementEnum, Colors } from 'src/types/interfaces/interface';
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
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  async createTicket(
    ticketDetails: CreateTicketParams,
    participants: AllUserEntity[],
  ): Promise<TicketEntity> {
    const newTicket = this.ticketRepository.create({
      ...ticketDetails,
      color: Colors.YELLOW, // start with Warning,
    });

    newTicket.contributors = participants;
    return this.ticketRepository.save(newTicket);
  }

  getTicketByNeed(flaskNeedId: number): Promise<TicketEntity> {
    const ticket = this.ticketRepository.findOne({
      where: {
        need: {
          flaskId: flaskNeedId,
        },
      },
      relations: {
        need: true,
      },
    });
    return ticket;
  }

  async getTicketById(id: string, flaskUserId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        need: true,
      },
    });

    const latestView = ticket.views.find(
      (v) =>
        Date.parse(v.viewed.toUTCString()) ===
        Math.max(
          ...ticket.views.map((t) => Date.parse(t.viewed.toUTCString())),
        ),
    );

    // create or update view
    const myView = ticket.views.find(
      (v) => v.flaskUserId === flaskUserId && v.ticketId === ticket.id,
    );

    if (myView) {
      await this.updateTicketView(latestView.viewed, myView);
      console.log('\x1b[36m%s\x1b[0m', 'Updated my view to latest ...\n');
    } else if (!myView) {
      const view = await this.createTicketView(flaskUserId, ticket.id);
      await this.updateTicketView(latestView.viewed, view);
      console.log('\x1b[36m%s\x1b[0m', 'created my view with latest time ...\n');
    }

    return { ticket, myView };
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
      viewed: new Date(),
    });
    return this.ticketViewRepository.save(newView);
  }

  async updateTicketContributors(
    ticket: TicketEntity,
    participants: AllUserEntity[],
  ): Promise<TicketEntity> {
    const oldParticipants = ticket.contributors;
    ticket.contributors = [...oldParticipants, ...participants]
    return this.ticketRepository.save(ticket);
  }

  async updateTicketView(
    currentTime: Date,
    view: TicketViewEntity,
  ): Promise<UpdateResult> {
    return this.ticketViewRepository.update(view.id, { viewed: currentTime });
  }

  async updateTicketAnnouncement(
    ticketId: string,
    lastAnnouncement: AnnouncementEnum,
  ): Promise<UpdateResult> {
    return this.ticketRepository.update(ticketId, {
      lastAnnouncement: lastAnnouncement,
    });
  }

  async updateTicketColor(
    ticketId: string,
    color: Colors,
  ): Promise<UpdateResult> {
    return this.ticketRepository.update(ticketId, {
      color: color,
    });
  }

  async updateTicketTime(
    ticket: TicketEntity,
    flaskUserId: number,
  ): Promise<Date> {
    const currentTime = new Date();
    await this.ticketRepository.update(ticket.id, {
      updatedAt: currentTime,
    });
    if (flaskUserId) {
      // create or update view
      const view = ticket.views.find(
        (v) => v.flaskUserId === flaskUserId && v.ticketId === ticket.id,
      );
      if (view) {
        await this.updateTicketView(currentTime, view);
        console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');
      } else {
        await this.createTicketView(flaskUserId, ticket.id);
        console.log('\x1b[36m%s\x1b[0m', 'created my view ...\n');
      }

      return view.updatedAt;
    }
  }

  createTicketContent(
    contentDetails: CreateTicketContentParams,
    ticket: TicketEntity,
  ): Promise<TicketContentEntity> {
    const newContent = this.ticketContentRepository.create({
      ...contentDetails,
    });
    newContent.ticket = ticket;
    return this.ticketContentRepository.save(newContent);
  }

  getTickets(): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      relations: {
        need: true,
      },
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

  DeleteTicket(id: string) {
    return this.ticketRepository.delete({ id });
  }

  // getUserNotifications(flaskUserId: number): Promise<[TicketEntity[], number]> {
  //   return this.ticketRepository
  //     .createQueryBuilder('ticketEntity')
  //     .leftJoinAndSelect("ticketEntity.views", "view")
  //     .leftJoinAndSelect("ticketEntity.ticketHistories", "ticketHistory")
  //     .where('ticketEntity.updatedAt > :startDate', { startDate: new Date(2019, 5, 3) })
  //     .andWhere('view.viewed < ticketEntity.updatedAt')
  // .where(
  //   new Brackets((qb) => {
  //     qb
  //       .where('view.flaskUserId = :flaskUserId', { flaskUserId: flaskUserId })
  //       .andWhere("(ticketEntity.updatedAt) <= (view.viewed)")
  //   }),
  // )
  // .leftJoinAndSelect("ticketEntity.contributors", "contributor")
  // .andWhere('ticketEntity.flaskUserId = :flaskUserId', { flaskUserId: flaskUserId })
  // .getManyAndCount()
  // }
}
