import { SwmypageStatusUpdates, SwmypageVerifiedPayments } from "src/generated-sources/openapi";

export class CreatePaymentDto {
    id?: number;
    verified?: Date;
    id_need: number
    id_user: number
    order_id: string
    credit_amount: number
    donation_amount: number
    card_no: string
    gateway_payment_id: string
    gateway_track_id: string
    need_amount: number
    transaction_date: Date
    created: Date
    updated: Date
}

