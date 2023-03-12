import { IsNotEmpty } from "class-validator"

export class CreateTicketColorDto {
    @IsNotEmpty()
    ticketId: string
    @IsNotEmpty()
    color: number
    @IsNotEmpty()
    flaskUserId: number
}

