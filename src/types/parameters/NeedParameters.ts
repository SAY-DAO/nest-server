import { NgoEntity } from "../../entities/ngo.entity";
import { SocialWorkerEntity } from "../../entities/user.entity";
import { NeedTypeEnum } from "../interface";

export type NeedParams = {
    flaskNeedId: number;
    flaskChildId: number;
    flaskNgoId: number;
    title: string;
    affiliateLinkUrl: string;
    bankTrackId: string | null;
    category: number;
    childGeneratedCode: string;
    childSayName: string;
    childDeliveryDate: Date | null;
    confirmDate: Date | null;
    confirmUser: number;
    cost: number;
    created: Date | null;
    createdById: SocialWorkerEntity;
    flaskSwId: number,
    deletedAt: Date | null;
    description: string;
    descriptionTranslations: { en: string, fa: string };
    details: string;
    donated: number;
    doneAt: Date | null;
    expectedDeliveryDate: Date | null;
    imageUrl: string;
    needRetailerImg: string;
    information: string;
    isConfirmed: boolean;
    doingDuration: number;
    isDeleted: boolean;
    isDone: boolean;
    isReported: boolean;
    isUrgent: boolean;
    titleTranslations: { en: string; fa: string };
    ngoAddress: string;
    ngo: NgoEntity;
    ngoName: string;
    ngoDeliveryDate: Date | null;
    oncePurchased: boolean;
    paid: number;
    progress: string;
    purchaseCost: any;
    purchaseDate: Date | null;
    receiptCount: number;
    status: number;
    statusDescription: any;
    statusUpdatedAt: Date | null;
    type: NeedTypeEnum;
    typeName: string;
    unavailableFrom: Date | null;
    unconfirmedAt: Date | null;
    unpaidCost: number;
    unpayable: boolean;
    unpayableFrom: Date | null;
    updated: Date;
}


