import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Cities extends BaseEntity {
    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    state_id: number

    @Column({ nullable: true })
    state_code: string

    @Column({ nullable: true })
    state_name: string

    @Column({ nullable: true })
    country_id: number

    @Column({ nullable: true })
    country_code: string

    @Column({ nullable: true })
    country_name: string

    @Column({ nullable: true })
    latitude: string

    @Column({ nullable: true })
    longitude: string

}