import { Children } from "./ChildrenRequest";
import { Need } from "./NeedRequest";

export class SyncRequest {
    totalCount: number;
    needData: Need[];
    childData: Children[];
    totalChildCount: number;

}
