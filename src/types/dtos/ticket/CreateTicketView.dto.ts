import { IsNotEmpty } from "class-validator"

export class CreateTicketViewDto {
    @IsNotEmpty()
    ticketId: string
    @IsNotEmpty()
    flaskUserId: number
}

