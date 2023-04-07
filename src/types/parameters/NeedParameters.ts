import { NeedTypeEnum } from "../interfaces/interface";

export type NeedParams = {
    flaskId: number
    flaskChildId: number
    createdById?: number
    name?: string,
    nameTranslations: Record<string, string>;
    descriptionTranslations: Record<string, string>;
    title?: string;
    status?: number;
    imageUrl?: string;
    category?: number;
    type?: NeedTypeEnum;
    isUrgent?: boolean;
    affiliateLinkUrl?: string;
    link?: string;
    doingDuration?: number;
    needRetailerImg?: string;
    purchaseCost?: any;
    cost?: number;
    information?: string;
    details?: string;
    doneAt?: Date | null;
    isConfirmed?: boolean;
    unavailableFrom?: Date | null;
    created?: Date;
    updated?: Date;
    purchaseDate?: Date
    ngoDeliveryDate?: Date
    expectedDeliveryDate?: Date
    childDeliveryDate?: Date
    confirmDate?: Date;
    bankTrackId?: string | null;

}
