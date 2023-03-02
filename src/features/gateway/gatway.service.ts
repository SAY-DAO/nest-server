import { Injectable, OnModuleInit } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { CreateTicketContentDto } from "src/types/dtos/ticket/CreateTicketContentDto.dto";
import { TicketService } from '../ticket/ticket.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000']
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
        console.log('\x1b[36m%s\x1b[0m', 'Sending back data to all ...\n');

        this.server.emit('onTicketMessage', {
            socketId: this.socketId,
            content: content
        })

        return content
    }

}
