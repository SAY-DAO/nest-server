export class MileStoneRequest {
  epics: StepRequest[];
  signature: string;
}

export class StepRequest {
  dueDate: Date;
  title: string;
  description: string;
  need_id: number;
}
