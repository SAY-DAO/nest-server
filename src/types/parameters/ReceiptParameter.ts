import { ChildrenEntity } from "src/entities/children.entity";
import { SocialWorkerEntity } from "../../entities/user.entity";

export type ReceiptParams = {
    title: string;
    description: string;
    attachment: string;
    isPublic: boolean;
    code: string;
    flaskSwId: number;
    socialWorker: SocialWorkerEntity;
    child: ChildrenEntity;
    needStatus: number;
    flaskReceiptId: number;
    deleted: boolean | null;
    flaskNeedId: number;
}
