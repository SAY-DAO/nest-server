import { Entity, Column, ManyToOne } from 'typeorm'
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

    @ManyToOne(() => NeedEntity, (need) => need.provider)
    needs: NeedEntity[]
}