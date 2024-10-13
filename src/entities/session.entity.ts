
import { Column, DeleteDateColumn, Entity, PrimaryColumn, } from "typeorm";

// used by session management and pg
@Entity()
export class Session  {
    @PrimaryColumn()
    sid: string

    @Column({ nullable: false })
    expire: Date

    @Column({ nullable: false, unique: true })
    sess: string

    @DeleteDateColumn()
    public destroyedAt?: Date;
}