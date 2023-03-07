import { Injectable, OnModuleInit } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { CreateTicketContentDto } from "src/types/dtos/ticket/CreateTicketContent.dto";
import { CreateTicketNotificationDto } from "src/types/dtos/ticket/CreateTicketNotif.dto";
import { CreateTicketViewDto } from "src/types/dtos/ticket/CreateTicketView.dto";
import { ticketNotifications } from "src/utils/helpers";
import { TicketService } from '../ticket/ticket.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'https://panel.saydao.org']
    }
})

@Injectable()
export class GateWayService implements OnModuleInit {
    constructor(
        private ticketService: TicketService,
    ) { }
    socketId: string

    @WebSocketServer()
    server: Server

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
            this.socketId = socket.id
            console.log('\x1b[36m%s\x1b[0m', 'Connected ...\n');
        })
    }

    @SubscribeMessage('newTicketMessage')
    async onNewTicketContent(@MessageBody() body: CreateTicketContentDto) {
        const ticket = await this.ticketService.getTicketById(body.ticketId)
        console.log('\x1b[36m%s\x1b[0m', 'Socket Creating Ticket Content ...\n');
        const content = await this.ticketService.createTicketContent({ message: body.message, from: body.from }, ticket)
        await this.ticketService.updateTicket(body.ticketId)

        console.log('\x1b[36m%s\x1b[0m', 'Sending back data to all ...\n');
        this.server.emit('onTicketMessage', {
            socketId: this.socketId,
            content: content
        })
        return content
    }


    @SubscribeMessage('ticketNotifications')
    async onTicketNotifications(@MessageBody() body: CreateTicketNotificationDto) {
        const myTickets = await this.ticketService.getUserTickets(body.flaskUserId)
        const unReads = ticketNotifications(myTickets, body.flaskUserId)
        if (unReads && unReads.length > 0) {
            console.log('\x1b[36m%s\x1b[0m', `Sending back ${unReads.length} Unread Tickets...\n`);
            this.server.emit(`onUnReadTickets${body.flaskUserId}`, {
                newTickets: unReads.map(t => {
                    const { id, title, ...others } = t
                    return { id, title }
                })
            })
            return unReads
        } else {
            console.log('\x1b[36m%s\x1b[0m', `No new Ticket notifications :(...\n`);

        }

    }

    @SubscribeMessage('newViewMessage')
    async onNewTicketView(@MessageBody() body: CreateTicketViewDto) {
        const ticket = await this.ticketService.getTicketById(body.ticketId)
        console.log('\x1b[36m%s\x1b[0m', 'Socket Updating Views...\n');
        console.log(body)
        const view = ticket.views.find((v) => (v.flaskUserId === body.flaskUserId && v.ticketId === body.ticketId))
        let newView
        if (view) {
            newView = await this.ticketService.updateTicketView(view.id)
        }
        newView = await this.ticketService.createTicketView(body.flaskUserId, ticket.id)
        await this.ticketService.updateTicket(newView.ticketId)
        console.log('\x1b[36m%s\x1b[0m', 'Sending back data to all ...\n');
        this.server.emit(`onViewMessage${newView.flaskUserId}`, {
            ticketId: ticket.id,
            viewId: newView.id,
            flaskUserId: newView.flaskUserId,
            lastView: newView.viewed,
            socketId: this.socketId,
        })
    }

}
