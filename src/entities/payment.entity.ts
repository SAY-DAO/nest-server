import {
    Entity,
    Column,
    ManyToOne,
    Index,
} from 'typeorm';
import { BaseEntity } from './BaseEntity'
import { NeedEntity } from './need.entity';
import { AllUserEntity } from './user.entity';

@Entity()
export class PaymentEntity extends BaseEntity {
    @Index({unique: true})
    @Column({ nullable: true })
    flaskId: number;

    @Column({ nullable: true })
    creditAmount: number;

    @Column({ nullable: true })
    orderId: string;
    
    @Column({ nullable: true })
    donationAmount: number;

    @Column({ nullable: true })
    cardNumber: string;

    @Column({ nullable: true })
    gatewayPaymentId: string;

    @Column({ nullable: true })
    gatewayTrackId: string;

    @Column({ nullable: true })
    needAmount: number;

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

    @ManyToOne(() => NeedEntity, (need) => need.verifiedPayments, { eager: true, nullable: true  })
    need: NeedEntity;

    @ManyToOne(() => AllUserEntity, (family) => family.payments, { eager: true })
    familyMember: AllUserEntity;
}

