import { IsNotEmpty } from "class-validator"

export class CreateTicketNotificationDto {
    @IsNotEmpty()
    flaskUserId: number
}

