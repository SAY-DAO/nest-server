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
import { CreateTicketDto } from '../../../types/dtos/ticket/CreateTicket.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Colors,
  NeedTypeEnum,
  PaymentStatusEnum,
  ProductStatusEnum,
} from 'src/types/interface';
import { TicketEntity } from '../../../entities/ticket.entity';
import { ServerError } from '../../../filters/server-exception.filter';
import { SyncService } from '../sync/sync.service';
import { AddTicketInterceptor } from './interceptors/addTicket.interceptors';
import { CreateTicketContentDto } from '../../../types/dtos/ticket/CreateTicketContent.dto';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { CreateTicketParams } from '../../../types/parameters/CreateTicketParameters';
import { TicketViewEntity } from 'src/entities/ticketView.entity';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
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

  @Get('ticket/:id')
  async findOne(@Param('id') id: string) {
    return await this.ticketService.getTicketById(id);
  }

  @Post('messages/add')
  async createTicketMsg(@Req() req: Request, @Body() request: CreateTicketContentDto) {
    const ticket = await this.ticketService.getTicketById(request.ticketId)
    const msg = request.message
    const from = request.from

    const contentDetails = {
      message: msg,
      from,
    };
    const ticketContent = await this.ticketService.createTicketContent(contentDetails, ticket);

    // 1- update ticket upadatedAt
    await this.ticketService.updateTicketTime(request.ticketId)
    // 2- update ticket view viewed
    const view = ticket.views.find((v) => (v.flaskUserId === request.from && v.ticketId === request.ticketId))
    try {
      await this.ticketService.updateTicketView(view)
    } catch (e) {
      throw new ObjectNotFound(e);
    }
    return ticketContent


  }

  @UseInterceptors(AddTicketInterceptor)
  @Post('add')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createTicket(@Req() req: Request, @Body() request: CreateTicketDto) {
    const accessToken = req.headers['authorization'];

    console.log('\x1b[36m%s\x1b[0m', 'Syncing ...\n');
    const {
      nestCaller,
      nestSocialWorker,
      nestAuditor,
      nestPurchaser,
      need,
    } = await this.syncService.syncNeed(
      accessToken,
      request.userId,
      request.need,
      request.childId,
      request.roles
    );

    const createTicketDetails: CreateTicketParams = {
      title: request.title,
      flaskNeedId: request.needId,
      need: need,
      flaskUserId: request.userId,
      role: convertFlaskToSayRoles(request.userType),
    };
    console.log('\x1b[36m%s\x1b[0m', 'Creating Participants ...\n');

    // if (!need.isConfirmed || need.status <= PaymentStatusEnum.NOT_PAID) {
    //   participants = [nestSocialWorker];
    // } else if (need.isConfirmed) {
    //   if (NeedTypeEnum.SERVICE) {
    //     if (need.status <= PaymentStatusEnum.COMPLETE_PAY) {
    //       participants = [nestSocialWorker];
    //     }
    //     participants = [nestSocialWorker, nestAuditor];
    //   }
    //   if (NeedTypeEnum.PRODUCT) {
    //     if (need.status <= PaymentStatusEnum.COMPLETE_PAY) {
    //       participants = [nestSocialWorker, nestAuditor];
    //     }
    //     if (need.status >= ProductStatusEnum.PURCHASED_PRODUCT) {
    //       participants = [nestSocialWorker, nestAuditor, nestPurchaser];
    //     }
    //   }
    // }
    const participants = [nestCaller, nestSocialWorker, nestAuditor, nestPurchaser].filter(p => p)
    console.log(participants)
    const uniqueParticipants = [...new Map(participants.map((p) => [p.id, p])).values()];

    console.log('\x1b[36m%s\x1b[0m', 'Creating The Ticket ...\n');
    const ticket = await this.ticketService.createTicket(createTicketDetails, uniqueParticipants)
    await this.ticketService.createTicketView(createTicketDetails.flaskUserId, ticket.id)

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
        throw new ServerError(e);
      }
      return provider;
    } else {
      throw new HttpException('you need to provide id', HttpStatus.BAD_REQUEST);
    }
  }
  @Patch('ticket/:id')
  async updateTicketColor(
    @Param('id') id: string,
    @Query('color') color: Colors
  ) {
    return await this.ticketService.updateTicketColor(id, color)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.ticketService.delete(id);
  }
}
