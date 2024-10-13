import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './CreateTicket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) { }
