import { CreateChildDto } from "./CreateChildren.dto";
import { CreateNeedDto } from "./CreateNeed.dto";
import { IsNotEmpty } from 'class-validator'

export class SyncRequestDto {
    childData?: CreateChildDto[];
    @IsNotEmpty()
    needData: CreateNeedDto[];
    childId?: number;
}
