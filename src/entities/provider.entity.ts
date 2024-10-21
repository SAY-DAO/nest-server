import { NeedTypeDefinitionEnum, NeedTypeEnum } from '../types/interfaces/interface'
import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity'

@Entity()
export class ProviderEntity extends BaseEntity {
    @Column()
    name: string

    @Column({ nullable: true })
    website: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    address: string

    @Column()
    city: number

    @Column()
    state: number

    @Column()
    country: number

    @Column()
    type: NeedTypeEnum

    @Column()
    typeName: NeedTypeDefinitionEnum

    @Column({ nullable: true })
    logoUrl: string

    @Column({ default: false })
    isActive: boolean

    @OneToMany(() => NeedEntity, (need) => need.provider)
    needs: NeedEntity[];
}