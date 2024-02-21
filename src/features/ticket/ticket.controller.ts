import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
  ValidationPipe,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from '../../types/dtos/ticket/CreateTicket.dto';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  AnnouncementEnum,
  FlaskUserTypesEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { TicketEntity } from '../../entities/ticket.entity';
import { SyncService } from '../sync/sync.service';
import { AddTicketInterceptor } from './interceptors/addTicket.interceptors';
import { CreateTicketContentDto } from '../../types/dtos/ticket/CreateTicketContent.dto';
import {
  convertFlaskToSayRoles,
  dateConvertToPersian,
  getSAYRoleInteger,
} from 'src/utils/helpers';
import { ValidateTicketPipe } from './pipes/validate-ticket.pipe';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { NeedService } from '../need/need.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { UserService } from '../user/user.service';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('Tickets')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private needService: NeedService,
    private readonly syncService: SyncService,
    private userService: UserService,
  ) {}

  @Get('all')
  async findAll(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.ticketService.getTickets();
  }

  @Get('all/user')
  async getUserTickets(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized!');
    }
    const user = await this.userService.getFlaskSocialWorker(panelFlaskUserId);
    if (convertFlaskToSayRoles(user.type_id) === SAYPlatformRoles.AUDITOR) {
      return await this.ticketService.getTickets();
    } else {
      return await this.ticketService.getUserTickets(panelFlaskUserId);
    }
  }

  @Get('ticket/:id')
  async getTicketById(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized!');
    }
    const { ticket } = await this.ticketService.getTicketById(
      id,
      Number(panelFlaskTypeId),
    );
    return ticket;
  }

  @Post('messages/add')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createTicketMsg(
    @Req() req: Request,
    @Body(ValidateTicketPipe) body: CreateTicketContentDto,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized!');
    }
    const { ticket } = await this.ticketService.getTicketById(
      body.ticketId,
      body.from,
    );
    const msg = body.message;
    const from = body.from;

    const contentDetails = {
      message: msg,
      from,
      announcement: AnnouncementEnum.NONE,
    };
    return await this.ticketService.createTicketContent(contentDetails, ticket);
  }

  @UseInterceptors(AddTicketInterceptor)
  @Post('add')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createTicket(
    @Req() req: Request,
    @Body(ValidateTicketPipe) body: CreateTicketDto,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized!');
    }
    const flaskNeed = await this.needService.getFlaskNeed(body.flaskNeedId);

    console.log('\x1b[36m%s\x1b[0m', 'Syncing ...\n');
    const { nestCaller, nestSocialWorker, nestAuditor, nestPurchaser, need } =
      await this.syncService.syncNeed(
        flaskNeed,
        flaskNeed.child_id,
        body.flaskUserId,
        body.receipts,
        body.payments,
        body.statuses,
      );

    const createTicketDetails: CreateTicketParams = {
      title: body.title,
      flaskNeedId: body.flaskNeedId,
      need: need,
      flaskUserId: body.flaskUserId,
      role: convertFlaskToSayRoles(body.userTypeId),
      lastAnnouncement: body.announcement,
    };

    console.log('\x1b[36m%s\x1b[0m', 'Creating Participants ...\n');

    body.roles.find(
      (role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR,
    );
    const participants = [
      nestCaller,
      body.roles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.SOCIAL_WORKER,
      ) && nestSocialWorker,
      body.roles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR,
      ) && nestAuditor,
      body.roles.find(
        (role) => getSAYRoleInteger(role) === SAYPlatformRoles.PURCHASER,
      ) && nestPurchaser,
    ].filter((p) => p);

    const uniqueParticipants = [
      ...new Map(participants.map((p) => [p.id, p])).values(),
    ];

    if (uniqueParticipants.length === 0) {
      throw new ServerError('You are doing something wrong buddy!');
    }

    if (uniqueParticipants.length === 1) {
      throw new ServerError('Two People is needed for the ticket');
    }

    if (need.ipfs) {
      throw new ServerError('After IPFS upload you can not change anything.');
    }

    let ticket: TicketEntity;
    ticket = await this.ticketService.getTicketByNeed(body.flaskNeedId);
    if (ticket) {
      console.log('\x1b[36m%s\x1b[0m', 'Updating The Ticket ...\n');
      ticket = await this.ticketService.updateTicketContributors(
        ticket,
        participants,
      );
    }
    if (!ticket) {
      console.log('\x1b[36m%s\x1b[0m', 'Creating The Ticket ...\n');
      ticket = await this.ticketService.createTicket(
        createTicketDetails,
        uniqueParticipants,
      );
    }

    // only when announce arrival
    if (body.announcement !== AnnouncementEnum.ARRIVED_AT_NGO) {
      await this.ticketService.createTicketView(
        createTicketDetails.flaskUserId,
        ticket.id,
      );
    }
    
    if (body.announcement === AnnouncementEnum.ARRIVED_AT_NGO) {
      const persianDate = dateConvertToPersian(String(body.arrivalDate));
      const contentDetails = {
        message: ` .به سمن رسید --- ${persianDate} --- ${`${new Date(
          body.arrivalDate,
        ).getFullYear()}-${
          new Date(body.arrivalDate).getMonth() + 1
        }-${new Date(body.arrivalDate).getDate()}`} `,

        from: body.flaskUserId,
        announcement: AnnouncementEnum.ARRIVED_AT_NGO,
        announcedArrivalDate: body.arrivalDate,
      };

      if (!body.arrivalDate) {
        throw new ServerError('Date is not provided');
      }
      await this.ticketService.createTicketContent(contentDetails, ticket);
    }
    // only when announce money received
    if (body.announcement === AnnouncementEnum.NGO_RECEIVED_MONEY) {
      const persianDate = dateConvertToPersian(String(body.arrivalDate));
      const contentDetails = {
        message: ` .مبلغ دریافت شد--- ${persianDate} --- ${`${new Date(
          body.arrivalDate,
        ).getFullYear()}-${
          new Date(body.arrivalDate).getMonth() + 1
        }-${new Date(body.arrivalDate).getDate()}`} `,

        from: body.flaskUserId,
        announcement: AnnouncementEnum.NGO_RECEIVED_MONEY,
        announcedArrivalDate: body.arrivalDate,
      };

      if (!body.arrivalDate) {
        throw new ServerError('Date is not provided');
      }
      await this.ticketService.createTicketContent(contentDetails, ticket);
    }
    await this.ticketService.updateTicketAnnouncement(
      ticket.id,
      body.announcement,
    );
    const { ticket: updatedTicket } = await this.ticketService.getTicketById(
      ticket.id,
      body.flaskUserId,
    );
    return updatedTicket;
  }

  @Delete(':id')
  async DeleteTicket(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.ticketService.DeleteTicket(id);
  }

  // @Get('notifications/:flaskUserId')
  // async getUserNotifications(@Param('flaskUserId') flaskUserId: number) {
  //   return await this.ticketService.getUserNotifications(
  //     Number(flaskUserId),
  //   );
  // }
}
