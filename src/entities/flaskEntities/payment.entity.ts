import {
    Entity,
    Column,
} from 'typeorm';
import { BaseEntity } from './BaseEntity'

@Entity()
export class Payment extends BaseEntity {
    @Column({ nullable: true })
    id_need: number;

    @Column({ nullable: true })
    id_user: number;

    @Column({ nullable: true })
    credit_amount: number;

    @Column({ nullable: true })
    donation_amount: number;

    @Column({ nullable: true })
    card_no: string;

    @Column({ nullable: true })
    gateway_payment_id: string;

    @Column({ nullable: true })
    gateway_track_id: string;

    @Column({ nullable: true })
    need_amount: number;

    @Column({ type: 'timestamptz', nullable: true })
    transaction_date: Date;

    @Column({ type: 'timestamptz', nullable: true })
    created: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated: Date;

    @Column({ type: 'timestamptz', nullable: true })
    verified: Date;
    
}

