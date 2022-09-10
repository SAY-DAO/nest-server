import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity'

@Entity()
export class ProviderEntity extends BaseEntity {
    @Column()
    name: string

    @Column()
    website: string

    @Column()
    signedRawTransaction: string

    @Column()
    provider_Id: string

    @Column()
    type: string

    @OneToMany(() => NeedEntity, (need) => need.provider)
    needs: NeedEntity[];
}