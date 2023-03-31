export class CreateReceiptDto {
    attachment?: string;
    description?: string;
    title?: string;
    isPublic?: boolean;
    code?: string;
    ownerId?: number;
    needStatus?: number;
    id?: number;
    deleted?: Date;

}