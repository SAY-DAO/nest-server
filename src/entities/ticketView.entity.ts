import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { TicketEntity } from "./ticket.entity";

@Entity()
export class TicketViewEntity extends BaseEntity {
    @Column({ nullable: false })
    flaskUserId: number

    @Column({ nullable: false })
    ticketId: string

    @ManyToOne(() => TicketEntity, (t) => t.views, { eager: false })
    ticket: TicketEntity;

    @Column({ type: 'timestamptz', nullable: false })
    viewed: Date;

}

