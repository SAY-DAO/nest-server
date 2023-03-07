import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from '../dtos/ticket/CreateTicket.dto';

export class UpdateTicketContentParams extends PartialType(CreateTicketDto) { }
