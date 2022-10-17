import { ChildrenEntity } from "../children.entity";
import { PaymentEntity } from "../payment.entity";
import { ProviderEntity } from "../provider.entity";
import { SignatureEntity } from "../signature.entity";
import { UserEntity } from "../user.entity";

export interface NeedInterface {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    flaskNeedId?: number;
    title?: string;
    affiliateLinkUrl?: string;
    bankTrackId?: string;
    category?: number;
    childGeneratedCode?: string;
    childSayName?: string;
    childDeliveryDate?: Date;
    confirmDate?: Date;
    confirmUser?: number;
    cost?: number;
    created?: Date;
    createdById?: number;
    deleted_at?: Date;
    description?: string;
    descriptionTranslations?: { en: string, fa: string };
    details?: string;
    doing_duration?: number;
    donated?: number;
    doneAt?: Date;
    expectedDeliveryDate?: Date;
    imageUrl?: string;
    needRetailerImg?: string;
    information?: string;
    isConfirmed?: boolean;
    isDeleted?: boolean;
    isDone?: boolean;
    isReported?: boolean;
    isUrgent?: boolean;
    link?: string;
    titleTranslations?: { en?: string; fa?: string };
    ngoAddress?: string;
    ngoId?: number;
    ngoName?: string;
    ngoDeliveryDate?: Date;
    oncePurchased?: boolean;
    paid?: number;
    progress?: string;
    purchaseCost?: number;
    purchaseDate?: Date;
    receiptCount?: number;
    receipts?: string;
    status?: number;
    statusDescription?: string;
    statusUpdatedAt?: Date;
    type?: number;
    typeName?: string;
    unavailableFrom?: Date;
    unconfirmedAt?: Date;
    unpaidCost?: number;
    unpayable?: boolean;
    unpayableFrom?: Date;
    updated?: Date;
    participants?: UserEntity[];
    payments?: PaymentEntity[];
    signatures?: SignatureEntity[];
    childId: number;
    provider?: ProviderEntity;

}