import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Req,
  UseInterceptors,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from '../../types/dtos/ticket/CreateTicket.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Colors, SAYPlatformRoles } from 'src/types/interfaces/interface';
import { TicketEntity } from '../../entities/ticket.entity';
import { SyncService } from '../sync/sync.service';
import { AddTicketInterceptor } from './interceptors/addTicket.interceptors';
import { CreateTicketContentDto } from '../../types/dtos/ticket/CreateTicketContent.dto';
import { convertFlaskToSayRoles, getSAYRoleInteger } from 'src/utils/helpers';
import { ValidateTicketPipe } from './pipes/validate-ticket.pipe';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { NeedService } from '../need/need.service';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private needService: NeedService,
    private readonly syncService: SyncService,
  ) { }

  @Get('all')
  async findAll() {
    return await this.ticketService.getTickets();
  }

  @Get('all/user/:userId')
  async getUserTickets(@Param('userId') userId: number) {
    return await this.ticketService.getUserTickets(userId);
  }

  @Get('ticket/:id/:userId')
  async findOne(@Param('id') id: string, @Param('userId') flaskUserId: string) {
    const { ticket } = await this.ticketService.getTicketById(id, Number(flaskUserId))
    return ticket
  }

  @Post('messages/add')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createTicketMsg(
    @Req() req: Request,
    @Body(ValidateTicketPipe) request: CreateTicketContentDto,
  ) {
    const { ticket } = await this.ticketService.getTicketById(request.ticketId, request.from);
    const msg = request.message;
    const from = request.from;

    const contentDetails = {
      message: msg,
      from,
    };
    return await this.ticketService.createTicketContent(
      contentDetails,
      ticket,
    );
  }

  @UseInterceptors(AddTicketInterceptor)
  @Post('add')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createTicket(@Req() req: Request, @Body(ValidateTicketPipe) body: CreateTicketDto) {
    const flaskNeed = await this.needService.getFlaskNeed(body.flaskNeedId)

    console.log('\x1b[36m%s\x1b[0m', 'Syncing ...\n');
    const { nestCaller, nestSocialWorker, nestAuditor, nestPurchaser, need } =
      await this.syncService.syncNeed(
        flaskNeed,
        flaskNeed.child_id,
        body.flaskUserId,
        body.receipts,
        body.payments,
        body.statuses,
        body.isDone,
        body.paid,
        body.unpayable,
        body.unpayableFrom
      );

    const createTicketDetails: CreateTicketParams = {
      title: body.title,
      flaskNeedId: body.flaskNeedId,
      need: need,
      flaskUserId: body.flaskNeedId,
      role: convertFlaskToSayRoles(body.userTypeId),
    };
    console.log('\x1b[36m%s\x1b[0m', 'Creating Participants ...\n');

    body.roles.find((role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR)
    const participants = [
      nestCaller,
      body.roles.find((role) => getSAYRoleInteger(role) === SAYPlatformRoles.SOCIAL_WORKER) && nestSocialWorker,
      body.roles.find((role) => getSAYRoleInteger(role) === SAYPlatformRoles.AUDITOR) && nestAuditor,
      body.roles.find((role) => getSAYRoleInteger(role) === SAYPlatformRoles.PURCHASER) && nestPurchaser,
    ].filter((p) => p);

    const uniqueParticipants = [
      ...new Map(participants.map((p) => [p.id, p])).values(),
    ];

    console.log('\x1b[36m%s\x1b[0m', 'Creating The Ticket ...\n');
    const ticket = await this.ticketService.createTicket(
      createTicketDetails,
      uniqueParticipants,
    );
    await this.ticketService.createTicketView(
      createTicketDetails.flaskUserId,
      ticket.id,
    );

    return ticket;
  }

  @Get(`ticket/:id`)
  @ApiOperation({ description: 'Get one by id' })
  async getOneTicket(@Param('id') id: string) {
    let provider: TicketEntity;
    if (id) {
      try {
        provider = await this.ticketService.getTicketByNeedId(parseInt(id));
      } catch (e) {
        throw new AllExceptionsFilter(e);
      }
      return provider;
    } else {
      throw new HttpException('you need to provide id', HttpStatus.BAD_REQUEST);
    }
  }
  @Patch('ticket/:id')
  async updateTicketColor(
    @Param('id') id: string,
    @Query('color') color: Colors,
  ) {
    return await this.ticketService.updateTicketColor(id, color);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.ticketService.delete(id);
  }
}
