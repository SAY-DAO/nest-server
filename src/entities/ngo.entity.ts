import { Entity, Column, OneToMany, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import { ChildrenEntity } from './children.entity';
import { CityEntity } from './city.entity';
import { ContributorEntity } from './contributor.entity';

@Entity()
export class NgoEntity extends BaseEntity {
    @Index({ unique: true })
    @Column({ nullable: true })
    flaskNgoId: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    balance: number;

    @Column({ nullable: true })
    cityId: number;

    @Column({ nullable: true })
    stateId: number;

    @Column({ nullable: true })
    countryId: number;

    @Column({ nullable: true })
    postalAddress: string;

    @Column({ nullable: true })
    emailAddress: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    registerDate?: Date;

    @Column({ nullable: true })
    currentSocialWorkerCount?: number

    @Column({ nullable: true })
    childrenCount?: number

    @Column({ nullable: true })
    currentChildrenCount?: number

    @Column({ nullable: true })
    socialWorkerCount?: number

    @Column({ type: 'timestamptz', nullable: true })
    created?: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated?: Date;

    @Column({ nullable: true })
    isDeleted?: boolean;

    @OneToMany(() => NeedEntity, (need) => need.ngo)
    needs: NeedEntity[];

    @OneToMany(() => ChildrenEntity, (c) => c.ngo)
    children?: ChildrenEntity[];

    @OneToMany(() => ContributorEntity, (sw) => sw.ngo)
    socialWorkers?: ContributorEntity[];

    @ManyToOne(() => CityEntity, (n) => n.ngos, { eager: true })
    city: CityEntity

}


@Entity()
export class NgoArrivalEntity extends BaseEntity {
    @Column({ nullable: false })
    arrivalCode: string;

    @Column({ nullable: false })
    deliveryCode: string;

    @Column({ nullable: true })
    website: string;

    @ManyToOne(() => NgoEntity)
    ngo: NgoEntity
}
