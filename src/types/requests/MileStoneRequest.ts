import { ChildrenEntity } from "../../entities/children.entity";

export class MileStoneRequest {
    epics: EpicRequest[];
    child_id: number;
    signature: string;
}

export class EpicRequest {
    dueDate: Date;
    description: string;
    need_id: number;
}
