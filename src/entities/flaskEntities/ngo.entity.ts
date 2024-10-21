import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class NGO extends BaseEntity {
    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    balance: number;

    @Column({ nullable: true })
    city_id: number;

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

    @Column({ type: 'timestamptz', nullable: true })
    created?: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated?: Date;

    @Column({ nullable: true })
    isDeleted?: boolean;

}
