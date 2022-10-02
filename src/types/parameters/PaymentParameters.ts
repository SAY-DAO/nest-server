export type PaymentParams = {
    bankAmount: number;
    cardNumber: string;
    cartPaymentId: string;
    created: Date | null;
    creditAmount: number;
    description: string;
    donationAmount: number;
    gatewayPaymentId: string;
    gatewayTrackId: string;
    hashedCardNumber: string;
    flaskPaymentId: number;
    flaskNeedId: number;
    flaskUserId: number;
    link: string;
    needAmount: number;
    orderId: string;
    totalAmount: number;
    transactionDate: Date | null;
    updated: Date | null;
    verified: Date | null;
}
