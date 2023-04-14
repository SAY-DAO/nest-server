import { AllUserEntity } from 'src/entities/user.entity';

export type PaymentParams = {
    flaskId: number;
    flaskNeedId: number;
    flaskUserId: number;
    orderId: string;
    verified?: Date;
    needAmount?: number;
    donationAmount?: number;
    creditAmount?: number;
    cardNumber: string;
    gatewayPaymentId: string;
    gatewayTrackId: string;
    transactionDate: Date;
    created: Date;
    updated: Date;
};
