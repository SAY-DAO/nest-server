export class CreateMileStoneDto {
  epics: CreateStepDto[];
  signature: string;
}

export class CreateStepDto {
  dueDate: Date;
  title: string;
  description: string;
  needId: number;
}
