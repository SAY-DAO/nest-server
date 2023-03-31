import { SwmypageStatusUpdates, SwmypageVerifiedPayments } from "src/generated-sources/openapi";

export class CreatePaymentDto {
    id?: number;
    idNeed?: number;
    idUser?: number;
    verified?: Date;
    needAmount?: number;
    donationAmount?: number;
    creditAmount?: number;
    useCredit?: boolean;
}
