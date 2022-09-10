import {
    Entity,
    Column,
    ManyToOne,
    Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity';
import { UserEntity } from './user.entity';

@Entity()
export class PaymentEntity extends BaseEntity {
    @Column({ nullable: false })
    @Index({ unique: true })
    payment_id: number;

    @Column({ nullable: true })
    bank_amount: number;

    @Column({ nullable: true })
    card_number: string;

    @Column({ nullable: true })
    credit_amount: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    donation_amount: number;

    @Column({ nullable: true })
    gateway_payment_id: string;

    @Column({ nullable: true })
    gateway_track_id: string;

    @Column({ nullable: true })
    hashed_card_no: string;

    @Column({ nullable: true })
    link: string;

    @Column({ nullable: true })
    total_amount: number;

    @Column({ type: 'timestamptz', nullable: true })
    transaction_date: Date;

    @Column({ type: 'timestamptz', nullable: true })
    created: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated: Date;

    @Column({ type: 'timestamptz', nullable: true })
    verified: Date;

    @ManyToOne(() => NeedEntity, (need) => need.payments, { eager: false })
    need: NeedEntity;

    @ManyToOne(() => UserEntity, (user) => user.payments, { eager: false })
    user: UserEntity;

}
