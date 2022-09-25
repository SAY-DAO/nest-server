
export interface Domain {
    name: string;
    version: string;
    verifyingContract: string;
    chainId: string;
}

export interface SocialWorkerVoucher {
    flaskNeedId: number;
    userId: number;
    child: string;
    provider: string; // Amazon, Local doctor ,...
    wallet: string;
    content: string;
}

export interface FamilyVoucher {
    flaskNeedId: number;
    userId: number;
    child: number;
    wallet: string;
    content: string;
}

export enum SignatureType {
    FAMILY = 'family',
    SW = 'social worker',
    Friend = 'friend',
}


export enum ProviderType {
    SERVICE = 'service',
    PRODUCT = 'product',

}
