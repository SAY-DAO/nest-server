import { NeedEntity } from "src/entities/need.entity"

export class CreateTicketParams {
    title: string
    need:NeedEntity
    role:number
    flaskUserId: number
    flaskNeedId:number
}
