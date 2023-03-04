import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from '../dtos/ticket/CreateTicketDto.dto';

export class UpdateTicketParams extends PartialType(CreateTicketDto) { }
