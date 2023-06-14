import {
  Injectable,
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TicketEntity } from 'src/entities/ticket.entity';
import { ServerError } from 'src/filters/server-exception.filter';
import { BadRequestTransformationFilter } from 'src/filters/socket-exception.filter';
import { CreateJoinRoomDto } from 'src/types/dtos/ticket/CreateJoinRoom.dto';
import { CreateTicketColorDto } from 'src/types/dtos/ticket/CreateTicketColor.dto';
import { CreateTicketContentDto } from 'src/types/dtos/ticket/CreateTicketContent.dto';
import { CreateTicketNotificationDto } from 'src/types/dtos/ticket/CreateTicketNotif.dto';
import { CreateTicketViewDto } from 'src/types/dtos/ticket/CreateTicketView.dto';
import {
  AnnouncementEnum,
  PanelContributors,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles, ticketNotifications } from 'src/utils/helpers';
import { TicketService } from '../ticket/ticket.service';
import { UserService } from '../user/user.service';
import { ValidateGatewayPipe } from './pipes/validate-gateway.pipe';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://panel.saydao.org',
      'nest.saydao.org',
    ],
  },
})
@Injectable()
export class GateWayController implements OnModuleInit {
  constructor(
    private ticketService: TicketService,
    private userService: UserService,
  ) {}
  socket: Socket;
  currentNotifications: TicketEntity[];
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    if (!this.socket || !this.socket.connected) {
      // server-side Initialization
      this.server.on('connection', (socket) => {
        this.socket = socket;
        console.log('check connection', socket.connected);
        console.log('\x1b[36m%s\x1b[0m', 'Connected ...');
        console.log(
          '\x1b[33m%s\x1b[0m',
          `Connected to Socket ${this.socket.id}...\n`,
        );
      });
    }
  }
  checkConnection() {
    const count = this.server.engine.getMaxListeners();
    // may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
    const count2 = this.server.of('/').sockets.size;
    console.log('count total listeners:', count);
    console.log('count current listeners:', count2);
  }

  @UseFilters(new BadRequestTransformationFilter()) // https://github.com/nestjs/nest/issues/5267
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('check:ticket:notifications')
  async onTicketNotifications(
    @MessageBody(ValidateGatewayPipe) body: CreateTicketNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.checkConnection();
    console.log('\x1b[36m%s\x1b[0m', `Checking Unread Tickets...`);
    const myTickets = await this.ticketService.getUserTickets(body.flaskUserId);
    const unReads = ticketNotifications(myTickets, body.flaskUserId);
    if (unReads && unReads.length > 0) {
      console.log(
        '\x1b[36m%s\x1b[0m',
        `Sending back ${unReads.length} Unread Tickets...\n`,
      );
      client.emit(`onUnReadTickets${body.flaskUserId}`, {
        newTickets: unReads.map((t) => {
          const { id, title, ...others } = t;
          return { id, title };
        }),
      });
      return unReads;
    } else {
      console.log(
        '\x1b[36m%s\x1b[0m',
        `No new Ticket notifications for userId: ${body.flaskUserId} :(...\n`,
      );
      client.emit(`onUnReadTickets${body.flaskUserId}`, {
        newTickets: [],
      });
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('new:ticket:message')
  async onNewTicketContent(
    @MessageBody(ValidateGatewayPipe) body: CreateTicketContentDto,
  ) {
    this.checkConnection();
    const { ticket } = await this.ticketService.getTicketById(
      body.ticketId,
      body.from,
    );
    console.log('\x1b[36m%s\x1b[0m', 'Socket Creating Ticket Content ...\n');
    const content = await this.ticketService.createTicketContent(
      {
        message: body.message,
        from: body.from,
        announcement: AnnouncementEnum.NONE,
      },
      ticket,
    );
    await this.ticketService.updateTicketTime(ticket, body.from);

    if (this.socket.connected) {
      console.log(
        '\x1b[36m%s\x1b[0m',
        `Sending back the content for ticket: ${body.ticketId}...`,
      );
      // send message to the room
      this.server
        .to(`room:${ticket.id}`)
        .emit(`onTicketMessage${body.ticketId}`, {
          socketId: this.socket.id,
          content: content,
        });
      return content;
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('new:ticket:view')
  async onNewTicketView(
    @MessageBody(ValidateGatewayPipe) body: CreateTicketViewDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('\x1b[36m%s\x1b[0m', 'Socket Updating Views...\n');
    const { ticket, myView } = await this.ticketService.getTicketById(
      body.ticketId,
      body.flaskUserId,
    );
    console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');
    if (this.socket.connected) {
      console.log('\x1b[36m%s\x1b[0m', 'Sending back view details ...\n');
      client.emit(`onViewMessage${myView.flaskUserId}`, {
        ticketId: ticket.id,
        viewId: myView.id,
        flaskUserId: myView.flaskUserId,
        lastView: myView.viewed,
        socketId: this.socket.id,
      });
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('change:ticket:color')
  async onTicketColorChange(
    @MessageBody(ValidateGatewayPipe) body: CreateTicketColorDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { ticket: ticketBeforeUpdate } =
      await this.ticketService.getTicketById(body.ticketId, body.flaskUserId);
    const caller = await this.userService.getFlaskSocialWorker(
      body.flaskUserId,
    );
    const ticketParticipant = ticketBeforeUpdate.contributors.find(
      (c) => c.flaskUserId === body.flaskUserId,
    );
    if (
      ticketParticipant &&
      ticketParticipant.contributions.find(
        (c) => c.flaskUserId == body.flaskUserId,
      ).panelRole !== PanelContributors.AUDITOR
    ) {
      throw new ServerError('You are not an AUDITOR');
    }
    await this.ticketService.updateTicketColor(body.ticketId, body.color);
    const { ticket } = await this.ticketService.getTicketById(
      body.ticketId,
      body.flaskUserId,
    );

    console.log('\x1b[36m%s\x1b[0m', 'Socket changing ticket color...\n');
    if (this.socket.connected) {
      for (let i = 0; i < ticket.contributors.length; i++) {
        if (ticket.contributors[i].flaskUserId !== body.flaskUserId)
          console.log(
            '\x1b[36m%s\x1b[0m',
            `Sending back color details user:${ticket.contributors[i].flaskUserId}...\n`,
          );
        client.emit(`onColorChange${ticket.contributors[i].flaskUserId}`, {
          ticketId: ticket.id,
          color: ticket.color,
          needFlaskId: ticket.flaskNeedId,
          needType: ticket.need.type,
          needStatus: ticket.need.status,
        });
        if (convertFlaskToSayRoles(caller.type_id) === SAYPlatformRoles.AUDITOR)
          console.log(
            '\x1b[36m%s\x1b[0m',
            `Sending back color details user:${body.flaskUserId}...\n`,
          );
        client.emit(`onColorChange${body.flaskUserId}`, {
          ticketId: ticket.id,
          color: ticket.color,
          needFlaskId: ticket.flaskNeedId,
          needType: ticket.need.type,
          needStatus: ticket.need.status,
        });
      }
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join:room')
  async onJoinRoom(
    @MessageBody(ValidateGatewayPipe) body: CreateJoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.socket.connected) {
      const { ticket } = await this.ticketService.getTicketById(
        body.ticketId,
        body.flaskUserId,
      );
      console.log('\x1b[36m%s\x1b[0m', `joining room:${ticket.id}...\n`);
      client.join(`room:${ticket.id}`);
    }
  }

  @UseFilters(new BadRequestTransformationFilter())
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave:room')
  async onLeaveRoom(
    @MessageBody(ValidateGatewayPipe) body: CreateJoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.socket.connected) {
      const { ticket } = await this.ticketService.getTicketById(
        body.ticketId,
        body.flaskUserId,
      );
      console.log('\x1b[36m%s\x1b[0m', `leaving room:${ticket.id}...\n`);
      client.leave(`room:${ticket.id}`);
    }
  }
}
