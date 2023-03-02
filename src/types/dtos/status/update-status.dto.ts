import { PartialType } from '@nestjs/swagger';
import { CreateStatusDto } from './create-status.dto';

export class UpdateStatusDto extends PartialType(CreateStatusDto) {
    flaskId: number
    swId?: number;
    flaskNeedId?: number;
    newStatus?: number;
    oldStatus?: number;
    created?: Date;
    updated?: Date;
}
