import { PaymentEntity } from "src/entities/payment.entity";
import { ReceiptEntity } from "src/entities/receipt.entity";
import { SwmypageInnerParticipants, SwmypageInnerReceipts_, SwmypageInnerVerifiedPayments } from "src/generated-sources/openapi";
import { NgoEntity } from "../../entities/ngo.entity";
import { FamilyEntity, SocialWorkerEntity } from "../../entities/user.entity";
import { NeedTypeEnum } from "../interface";
import { SocialWorkerParams } from "./UserParameters";

export type NeedParams = {
    flaskNgoId: number;
    flaskChildId: number;
    flaskNeedId: number;
    createdById: number
    descriptionTranslations: { en: string, fa: string };
    name: string,
    title: string;
    status: number;
    titleTranslations: { en: string; fa: string };
    description: string;
    details: string;
    imageUrl: string;
    category: number;
    type: NeedTypeEnum;
    isUrgent: boolean;
    affiliateLinkUrl: string;
    link: string;
    doingDuration: number;
    needRetailerImg: string;
    paid: number;
    purchaseCost: any;
    cost: number;
    unpayable: boolean;
    isDone: boolean;
    doneAt: Date | null;
    isDeleted: boolean;
    isConfirmed: boolean;
    unpayableFrom: Date | null;
    created: Date;
    updated: Date;
    purchaseDate: Date
    ngoDeliveryDate: Date
    confirmDate: Date | null;
    auditor: SocialWorkerParams;
    deletedAt: Date | null;
    bankTrackId: string | null;
    receipts: SwmypageInnerReceipts_[],
    verifiedPayments: SwmypageInnerVerifiedPayments[],
    participants: SwmypageInnerParticipants[],
}
