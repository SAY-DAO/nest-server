import { AnnouncementEnum, Colors } from "../interfaces/interface"

export class CreateTicketContentParams {
    from: number
    message: string
    announcement: AnnouncementEnum
    announcedArrivalDate?: Date
    color?: Colors |null
}
