import { Entity, Column, OneToMany, Index } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity'
import { ChildrenEntity } from './children.entity'

@Entity()
export class NgoEntity extends BaseEntity {
    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    website: string

    @Index({ unique: true })
    @Column()
    flaskNgoId: number

    @Column({ nullable: true })
    city: number

    @Column({ nullable: true })
    state: number

    @Column({ nullable: true })
    country: number

    @Column({ nullable: true })
    postalAddress: string

    @Column({ nullable: true })
    emailAddress: string

    @Column({ nullable: true })
    phoneNumber: string

    @Column({ nullable: true })
    logoUrl: string

    @Column({ default: false })
    isActive: boolean

    @OneToMany(() => NeedEntity, (need) => need.ngo)
    needs: NeedEntity[];

    @OneToMany(() => ChildrenEntity, (c) => c.ngo)
    children?: ChildrenEntity[]
}

