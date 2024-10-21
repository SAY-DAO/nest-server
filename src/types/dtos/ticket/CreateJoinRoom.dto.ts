import { IsNotEmpty } from "class-validator"

export class CreateJoinRoomDto {
    @IsNotEmpty()
    ticketId: string
    @IsNotEmpty()
    flaskUserId: number
}

