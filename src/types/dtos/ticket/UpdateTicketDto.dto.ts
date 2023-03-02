import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './CreateTicketDto.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) { }
