import { IsNotEmpty } from 'class-validator';
import { SwmypageInnerNeeds } from 'src/generated-sources/openapi';
import { CreateChildrenDto } from './CreateChild.dto';
import { CreateSocialWorkerDto } from './CreateUser.dto';

export class SwCreateSwSignatureDto {
    @IsNotEmpty()
    need: SwmypageInnerNeeds;
    @IsNotEmpty()
    child: CreateChildrenDto;
    @IsNotEmpty()
    socialWorker: CreateSocialWorkerDto;
    @IsNotEmpty()
    signerAddress: string;
}

export class FamilyCreateSwSignatureDto {
    userId: number;
    needId: number;
    childId: number;
    signerAddress: string;
}
