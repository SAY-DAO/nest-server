export class CreateReceiptDto {
    title: string;
    description: string;
    attachment: string;
    isPublic: boolean;
    code: string;
    ownerId: number;
    needStatus: number;
    id: number;
    deleted: boolean | null;
}
