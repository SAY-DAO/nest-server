import { AnnouncementEnum } from "src/types/interfaces/interface";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { TicketEntity } from "./ticket.entity";

@Entity()
export class TicketContentEntity extends BaseEntity {
    @Column({ nullable: false })
    message: string

    @Column({ nullable: false })
    from: number

    @Column({ nullable: true })
    announcement: AnnouncementEnum

    @ManyToOne(() => TicketEntity, (t) => t.ticketHistory, { eager: false })
    ticket: TicketEntity;
}

