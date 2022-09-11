import { ChildRequest } from "./ChildrenRequest";
import { NeedRequest } from "./NeedRequest";

export class SyncRequest {
    childData?: ChildRequest[];
    needData?: NeedRequest[];
    totalCount?: number;
    totalChildCount?: number;
    childId?: number;
}
