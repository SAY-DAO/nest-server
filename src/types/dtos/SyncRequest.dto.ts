import { CreateChildDto } from "./CreateChildren.dto";
import { CreateNeedDto } from "./CreateNeed.dto";
import { IsNotEmpty } from 'class-validator'

export class SyncRequestDto {
    childData?: CreateChildDto[];
    @IsNotEmpty() // through the ValidationPipe
    needData: CreateNeedDto[];
    childId?: number;
    ngoId?: number;
    swId?: number;
}
