import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './CreateTicketDto.dto';

export class UpdateTicketContentDto extends PartialType(CreateTicketDto) { }
