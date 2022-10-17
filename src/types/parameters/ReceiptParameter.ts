export type ReceiptParams = {
    title: string;
    description: string;
    attachment: string;
    isPublic: boolean;
    code: string;
    flaskSwId: number;
    needStatus: number;
    flaskReceiptId: number;
    deleted: boolean | null;
    flaskNeedId: number;
}