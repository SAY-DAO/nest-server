import { CreateChildDto } from "./CreateChildren.dto";
import { NeedDto } from "./CreateNeed.dto";
import { IsNotEmpty } from 'class-validator'

export class SyncRequestDto {
    childData?: CreateChildDto[];
    @IsNotEmpty() // through the ValidationPipe
    needData: NeedDto[];
    childId?: number;
    ngoId?: number;
    swId?: number;
}
