export interface Domain {
    name: string;
    version: string;
    verifyingContract: string;
    chainId: string;
}

export interface SwSignatureResult {
    SocialWorkerVoucher: SwProductVoucher | SwServiceVoucher;
    types: VoucherTypes;
    domain: Domain;
}
export interface VoucherTypes {
    Voucher: { name: string; type: string; }[];
}


export interface SwServiceVoucher {
    title: string;
    category: CategoryDefinitionEnum;
    child: string;
    receipts: string; // title1, title2, ...
    bankTrackId: string,
    signerAddress: string;
    content: string;
}

export interface SwProductVoucher {
    title: string;
    category: CategoryDefinitionEnum;
    child: string;
    receipts: string; // title1, title2, ...
    signerAddress: string;
    content: string;
}

export interface FamilyVoucher {
    flaskNeedId: number;
    userId: number;
    child: number;
    wallet: string;
    content: string;
}

export enum SignatureEnum {
    FAMILY = 'family',
    SW = 'social worker',
    Friend = 'friend',
}

/*   
---- PAYMENT-----
partial payment status = 1
complete payment status = 2

---- PRODUCT ---type = 1---
complete purchase for product status = 3
complete delivery for product to NGO status = 4
complete delivery to child status = 5

----- SERVICE ---type = 0---
complete money transfer to NGO for service status = 3
complete delivery to child for service status = 4
*/

export enum NeedTypeEnum {
    SERVICE = 0,
    PRODUCT = 1,
}

export enum PaymentStatusEnum {
    PARTIAL_PAY = 1,
    COMPLETE_PAY = 2,
}

export enum ServiceStatusEnum {
    PARTIAL_PAY = PaymentStatusEnum.PARTIAL_PAY,
    COMPLETE_PAY = PaymentStatusEnum.COMPLETE_PAY,
    MONEY_TO_NGO = 3,
    DELIVERED = 4,
}

export enum ProductStatusEnum {
    PARTIAL_PAY = PaymentStatusEnum.PARTIAL_PAY,
    COMPLETE_PAY = PaymentStatusEnum.COMPLETE_PAY,
    PURCHASED_PRODUCT = 3,
    DELIVERED_TO_NGO = 4,
    DELIVERED = 5,
}

export enum CategoryEnum {
    GROWTH = 0,
    JOY = 1,
    HEALTH = 2,
    SURROUNDING = 3,
}

export enum CategoryDefinitionEnum {
    GROWTH = "Growth",
    JOY = "Joy",
    HEALTH = "Health",
    SURROUNDING = "Surrounding",
}
