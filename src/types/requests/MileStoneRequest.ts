import { ChildrenEntity } from "../../entities/children.entity";

export class MileStoneRequest {
    epics: EpicRequest[];
    signature: string;
}

export class EpicRequest {
    dueDate: Date;
    title: string;
    description: string;
    need_id: number;
}
