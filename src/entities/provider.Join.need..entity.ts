import { Entity, Column, Index } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity()
export class ProviderJoinNeedEntity extends BaseEntity {
    @Index({ unique: true })
    @Column({ nullable: false })
    flaskNeedId: number

    @Column({ nullable: false })
    nestProviderId: string
}