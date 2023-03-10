import { Injectable, OnModuleInit } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { TicketEntity } from "src/entities/ticket.entity";
import { TicketViewEntity } from "src/entities/ticketView.entity";
import { CreateTicketColorDto } from "src/types/dtos/ticket/CreateTicketColor.dto";
import { CreateTicketContentDto } from "src/types/dtos/ticket/CreateTicketContent.dto";
import { CreateTicketNotificationDto } from "src/types/dtos/ticket/CreateTicketNotif.dto";
import { CreateTicketViewDto } from "src/types/dtos/ticket/CreateTicketView.dto";
import { ticketNotifications } from "src/utils/helpers";
import { TicketService } from '../ticket/ticket.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'https://panel.saydao.org', 'https://nest.saydao.org']
    }
})

@Injectable()
export class GateWayService implements OnModuleInit {
    constructor(
        private ticketService: TicketService,
    ) { }
    socket: Socket
    currentNotifications: TicketEntity[]
    @WebSocketServer()
    server: Server

    onModuleInit() {
        if (!this.socket || !this.socket.connected) {
            // server-side Initialization
            this.server.on('connection', (socket) => {
                this.socket = socket
                console.log('check connection', socket.connected);
                console.log('\x1b[36m%s\x1b[0m', 'Connected ...');
                console.log('\x1b[33m%s\x1b[0m', `Connected to Socket ${this.socket.id}...\n`);
            })
        }
    }
    checkConnection() {
        const count = this.server.engine.getMaxListeners();
        // may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
        const count2 = this.server.of("/").sockets.size;
        console.log('count total listeners:', count);
        console.log('count current listeners:', count2);

    }



    @SubscribeMessage('check:ticket:notifications')
    async onTicketNotifications(@MessageBody() body: CreateTicketNotificationDto,
        @ConnectedSocket() client: Socket,
    ) {
        this.checkConnection()
        console.log('\x1b[36m%s\x1b[0m', `Checking Unread Tickets...`);
        const myTickets = await this.ticketService.getUserTickets(body.flaskUserId)
        const unReads = ticketNotifications(myTickets, body.flaskUserId)
        if (unReads && unReads.length > 0) {
            console.log('\x1b[36m%s\x1b[0m', `Sending back ${unReads.length} Unread Tickets...\n`);
            client.emit(`onUnReadTickets${body.flaskUserId}`, {
                newTickets: unReads.map(t => {
                    const { id, title, ...others } = t
                    return { id, title }
                })
            })
            return unReads
        } else {
            console.log('\x1b[36m%s\x1b[0m', `No new Ticket notifications for userId: ${body.flaskUserId} :(...\n`);
            client.emit(`onUnReadTickets${body.flaskUserId}`, {
                newTickets: []
            })

        }

    }

    @SubscribeMessage('new:ticket:message')
    async onNewTicketContent(@MessageBody() body: CreateTicketContentDto,
        @ConnectedSocket() client: Socket,
    ) {
        this.checkConnection()
        const ticket = await this.ticketService.getTicketById(body.ticketId)
        console.log('\x1b[36m%s\x1b[0m', 'Socket Creating Ticket Content ...\n');
        const content = await this.ticketService.createTicketContent({ message: body.message, from: body.from }, ticket)
        await this.ticketService.updateTicketTime(body.ticketId)
        const view = ticket.views.find((v) => (v.flaskUserId === body.from && v.ticketId === body.ticketId))
        if (view) {
            this.ticketService.updateTicketView(view)
            console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');
        } else {
            this.ticketService.createTicketView(body.from, ticket.id)
            console.log('\x1b[36m%s\x1b[0m', 'created my view ...\n');
        }

        if (this.socket.connected) {
            console.log('\x1b[36m%s\x1b[0m', `Sending back the content for ticket: ${body.ticketId}...`);
            // send message to the room
            this.server.to(`room:${ticket.id}`).emit(`onTicketMessage${body.ticketId}`, {
                socketId: this.socket.id,
                content: content
            })
            return content
        }

    }

    @SubscribeMessage('new:ticket:view')
    async onNewTicketView(@MessageBody() body: CreateTicketViewDto,
        @ConnectedSocket() client: Socket,
    ) {
        const ticket = await this.ticketService.getTicketById(body.ticketId)
        console.log('\x1b[36m%s\x1b[0m', 'Socket Updating Views...\n');
        console.log(body)
        const view = ticket.views.find((v) => (v.flaskUserId === body.flaskUserId && v.ticketId === body.ticketId))
        let newView: TicketViewEntity
        if (view) {
            newView = await this.ticketService.updateTicketView(view)
        } else {
            newView = await this.ticketService.createTicketView(body.flaskUserId, ticket.id)
        }
        console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');

        if (this.socket.connected) {
            console.log('\x1b[36m%s\x1b[0m', 'Sending back view details ...\n');
            client.emit(`onViewMessage${newView.flaskUserId}`, {
                ticketId: ticket.id,
                viewId: newView.id,
                flaskUserId: newView.flaskUserId,
                lastView: newView.viewed,
                socketId: this.socket.id,
            })
        }
    }

    @SubscribeMessage('change:ticket:color')
    async onTicketColorChange(@MessageBody() body: CreateTicketColorDto,
        @ConnectedSocket() client: Socket,
    ) {
        this.ticketService.updateTicketColor(body.ticketId, body.color)
        console.log('\x1b[36m%s\x1b[0m', 'Socket changing ticket color...\n');
        console.log(body)
        const ticket = await this.ticketService.getTicketById(body.ticketId)
        const view = ticket.views.find((v) => (v.flaskUserId === body.color && v.ticketId === body.ticketId))
        let newView: TicketViewEntity
        if (view) {
            newView = await this.ticketService.updateTicketView(view)
        } else {
            newView = await this.ticketService.createTicketView(body.flaskUserId, ticket.id)
        }
        console.log('\x1b[36m%s\x1b[0m', 'Updated my view ...\n');

        if (this.socket.connected) {
            for (let i = 0; i < ticket.contributors.length; i++) {
                if (ticket.contributors[i].flaskId !== body.flaskUserId)
                    console.log('\x1b[36m%s\x1b[0m', `Sending back color details use:${ticket.contributors[i].flaskId}...\n`);
                client.emit(`onColorChange${ticket.contributors[i].flaskId}`, {
                    ticketId: ticket.id,
                    color: ticket.color,
                })
            }

        }
    }

    @SubscribeMessage('join:room')
    async onJoinRoom(@MessageBody() body: { ticketId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (this.socket.connected) {
            const ticket = await this.ticketService.getTicketById(body.ticketId)
            console.log('\x1b[36m%s\x1b[0m', `joining room:${ticket.id}...\n`);
            client.join(`room:${ticket.id}`)

        }
    }

    @SubscribeMessage('leave:room')
    async onLeaveRoom(@MessageBody() body: { ticketId: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (this.socket.connected) {
            const ticket = await this.ticketService.getTicketById(body.ticketId)
            console.log('\x1b[36m%s\x1b[0m', `leaving room:${ticket.id}...\n`);
            client.leave(`room:${ticket.id}`)

        }
    }
}
