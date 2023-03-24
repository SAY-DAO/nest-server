import { NeedTypeEnum } from "../interfaces/interface";

export type NeedParams = {
    flaskId: number
    flaskChildId: number
    createdById?: number
    name?: string,
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
    paid?: number;
    purchaseCost?: any;
    cost?: number;
    unpayable?: boolean;
    isDone?: boolean;
    doneAt?: Date | null;
    isConfirmed?: boolean;
    unpayableFrom?: Date | null;
    created?: Date;
    updated?: Date;
    purchaseDate?: Date
    ngoDeliveryDate?: Date
    confirmDate?: Date | null;
    bankTrackId?: string | null;
}
