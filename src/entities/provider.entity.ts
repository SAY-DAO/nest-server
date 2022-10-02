import { NeedTypeEnum } from '../types/interface'
import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity'

@Entity()
export class ProviderEntity extends BaseEntity {
    @Column()
    name: string

    @Column()
    website: string

    @Column({ nullable: true })
    description: string

    @Column()
    city: number

    @Column()
    state: number

    @Column()
    country: number

    @Column()
    type: NeedTypeEnum

    @Column({ nullable: true })
    logoUrl: string

    @Column({ default: false })
    isActive: boolean


    @OneToMany(() => NeedEntity, (need) => need.provider)
    needs: NeedEntity[];
}