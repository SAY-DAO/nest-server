
import { Column, DeleteDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

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