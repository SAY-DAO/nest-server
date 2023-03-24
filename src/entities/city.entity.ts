import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NgoEntity } from './ngo.entity';


@Entity()
export class CityEntity extends BaseEntity {
    @Column()
    flaskCityId: number

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    stateId: number

    @Column({ nullable: true })
    stateCode: string

    @Column({ nullable: true })
    stateName: string

    @Column({ nullable: true })
    countryId: number

    @Column({ nullable: true })
    countryCode: string

    @Column({ nullable: true })
    countryName: string

    @Column({ nullable: true })
    latitude: string

    @Column({ nullable: true })
    longitude: string

    @OneToMany(() => NgoEntity, (n) => n.city, { eager: false })
    ngos?: NgoEntity[];
}