import {
    Entity,
    Column,
    ManyToOne,
    Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity';
import { FamilyEntity } from './user.entity';

@Entity()
export class PaymentEntity extends BaseEntity {
    @Index({ unique: true })
    @Column()
    flaskPaymentId: number;

    @Column({ nullable: true })
    bankAmount: number;

    @Column({ nullable: true })
    cardNumber: string;

    @Column({ nullable: true })
    creditAmount: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    donationAmount: number;

    @Column({ nullable: true })
    gatewayPaymentId: string;

    @Column({ nullable: true })
    gatewayTrackId: string;

    @Column({ nullable: true })
    hashedCardNumber: string;

    @Column({ nullable: true })
    link: string;

    @Column({ nullable: true })
    totalAmount: number;

    @Column({ type: 'timestamptz', nullable: true })
    transactionDate: Date;

    @Column({ type: 'timestamptz', nullable: true })
    created: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated: Date;

    @Column({ type: 'timestamptz', nullable: true })
    verified: Date;

    @Column()
    flaskNeedId: number;

    @Column()
    flaskUserId: number;

    @ManyToOne(() => NeedEntity, (need) => need.payments, { eager: false })
    need: NeedEntity;

    @ManyToOne(() => FamilyEntity, (user) => user.payments, { eager: false })
    user: FamilyEntity;

}
