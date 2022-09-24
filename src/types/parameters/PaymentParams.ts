export type PaymentParams = {
    bankAmount: number;
    cardNo: string;
    cartPaymentId: string;
    created: Date | null;
    creditAmount: number;
    description: string;
    donationAmount: number;
    gatewayPaymentId: string;
    gatewayTrackId: string;
    hashedCardNo: string;
    paymentId: number;
    needId: number;
    userId: number;
    link: string;
    needAmount: number;
    orderId: string;
    totalAmount: number;
    transactionDate: Date | null;
    updated: Date | null;
    verified: Date | null;
}
