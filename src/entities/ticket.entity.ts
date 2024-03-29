import { AnnouncementEnum, Colors, SAYPlatformRoles } from "src/types/interfaces/interface";
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { NeedEntity } from "./need.entity";
import { TicketContentEntity } from "./ticketContent.entity";
import { TicketViewEntity } from "./ticketView.entity";
import { AllUserEntity } from "./user.entity";

@Entity()
export class TicketEntity extends BaseEntity {
    @Column({ nullable: true })
    role: SAYPlatformRoles

    @Column({ nullable: false })
    color: Colors

    @Column({ nullable: true })
    title: string

    @Index()
    @Column()
    flaskUserId: number

    @Column()
    flaskNeedId: number

    @Column({ nullable: true })
    lastAnnouncement: AnnouncementEnum

    @ManyToMany(() => AllUserEntity, (user) => user.tickets, { eager: true })
    @JoinTable()
    contributors?: AllUserEntity[];

    @ManyToOne(() => NeedEntity, (n) => n.tickets, { eager: false, nullable: false })
    need: NeedEntity

    @OneToMany(() => TicketContentEntity, (c) => c.ticket, { eager: true, nullable: true })
    ticketHistories?: TicketContentEntity[]

    @OneToMany(() => TicketViewEntity, (v) => v.ticket, { eager: true, onDelete: 'CASCADE' })
    views: TicketViewEntity[]

}

