import { IsNotEmpty } from "class-validator"

export class CreateTicketContentDto {
    @IsNotEmpty()
    ticketId: string
    @IsNotEmpty()
    message: string
}

