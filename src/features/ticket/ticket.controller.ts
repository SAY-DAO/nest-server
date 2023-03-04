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
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from '../../types/dtos/ticket/CreateTicketDto.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateTicketDto } from '../../types/dtos/ticket/UpdateTicketDto.dto';
import {
  Colors,
  NeedTypeEnum,
  PaymentStatusEnum,
  ProductStatusEnum,
  RolesEnum,
  SAYPlatformRoles,
} from 'src/types/interface';
import { TicketEntity } from '../../entities/ticket.entity';
import { ServerError } from '../../filters/server-exception.filter';
import { SyncService } from '../sync/sync.service';
import { AddTicketInterceptor } from './interceptors/addTicket.interceptors';
import { AllUserEntity } from '../../entities/user.entity';
import { CreateTicketContentDto } from '../../types/dtos/ticket/CreateTicketContentDto.dto';
import { UserService } from '../user/user.service';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { CreateTicketParams } from '../../types/parameters/CreateTicketParameters';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly syncService: SyncService,
    private readonly userService: UserService,
  ) { }

  @Get('all')
  async findAll() {
    return await this.ticketService.getTickets();
  }

  @Get('all/user/:userId')
  async findUserTickets(@Param('userId') userId: number) {
    console.log(userId)
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
    return this.ticketService.createTicketContent(contentDetails, ticket);

  }

  @UseInterceptors(AddTicketInterceptor)
  @Post('add')
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
      request.ngoId,
      request.roles
    );

    const createTicketDetails: CreateTicketParams = {
      title: request.title,
      flaskNeedId: request.needId,
      need: need,
      flaskUserId: request.userId,
      role: convertFlaskToSayRoles(request.userType),
    };

    let participants: any[]
    if (!need.isConfirmed) {
      participants = [nestSocialWorker];
    } else if (need.isConfirmed) {
      if (NeedTypeEnum.SERVICE) {
        if (need.status <= PaymentStatusEnum.COMPLETE_PAY) {
          participants = [nestSocialWorker];
        }
        participants = [nestSocialWorker, nestAuditor];
      }
      if (NeedTypeEnum.PRODUCT) {
        if (need.status <= PaymentStatusEnum.COMPLETE_PAY) {
          participants = [nestSocialWorker, nestAuditor];
        }
        if (need.status >= ProductStatusEnum.PURCHASED_PRODUCT) {
          participants = [nestSocialWorker, nestAuditor, nestPurchaser];
        }
      }
    }
    participants = [nestCaller, ...participants]
    const uniqueParticipants = [...new Map(participants.map((p) => [p.id, p])).values()];

    console.log('\x1b[36m%s\x1b[0m', 'Creating The Ticket ...\n');
    return this.ticketService.createTicket(createTicketDetails, uniqueParticipants);
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
    await this.ticketService.updateTicketColor(id, color)
    return {id, color};
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
