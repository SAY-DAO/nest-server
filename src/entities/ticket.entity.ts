import { SAYPlatformRoles } from "src/types/interface";
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { NeedEntity } from "./need.entity";
import { TicketContentEntity } from "./ticketContent.entity";
import { AllUserEntity, ContributorEntity } from "./user.entity";

@Entity()
export class TicketEntity extends BaseEntity {
    // @OneToOne(() => AllUserEntity)
    // @JoinColumn()
    // user: AllUserEntity;

    @Column({ nullable: true })
    role: SAYPlatformRoles

    @Column({ nullable: true })
    title: string

    @Index()
    @Column()
    flaskUserId: number

    @Column()
    flaskNeedId: number

    @ManyToMany(() => ContributorEntity, (user) => user.tickets, { eager: true })
    @JoinTable()
    contributors?: ContributorEntity[];

    @ManyToOne(() => NeedEntity, (n) => n.tickets, { eager: true })
    need?: NeedEntity

    @OneToMany(() => TicketContentEntity, (c) => c.ticket, { eager: true })
    ticketHistory?: TicketContentEntity[]

}

