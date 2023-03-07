import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './CreateTicket.dto';

export class UpdateTicketContentDto extends PartialType(CreateTicketDto) { }
