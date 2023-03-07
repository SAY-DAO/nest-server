import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from '../dtos/ticket/CreateTicket.dto';

export class UpdateTicketParams extends PartialType(CreateTicketDto) { }
