import { AnnouncementEnum } from "../interfaces/interface"

export class CreateTicketContentParams {
    from: number
    message: string
    announcement: AnnouncementEnum
}
