import { Entity, Column, OneToMany, Index } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity'
import { ChildrenEntity } from './children.entity'
import { SocialWorkerEntity } from './user.entity'

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
    cityId: number

    @Column({ nullable: true })
    stateId: number

    @Column({ nullable: true })
    countryId: number

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

    @Column({ type: 'timestamptz', nullable: true })
    registerDate?: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated?: Date;


    @Column({ nullable: true })
    isDeleted?: boolean;


    @OneToMany(() => NeedEntity, (need) => need.ngo)
    needs: NeedEntity[];

    @OneToMany(() => ChildrenEntity, (c) => c.ngo)
    children?: ChildrenEntity[]

    @OneToMany(() => SocialWorkerEntity, (sw) => sw.ngo)
    socialWorkers?: SocialWorkerEntity[]
}

