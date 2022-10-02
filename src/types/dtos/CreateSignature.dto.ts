import { IsNotEmpty } from 'class-validator';

export class SwCreateSwSignatureDto {
    @IsNotEmpty()
    flaskSwId: number;
    @IsNotEmpty()
    flaskNeedId: number;
    @IsNotEmpty()
    flaskChildId: number;
    @IsNotEmpty()
    signerAddress: string
}

export class FamilyCreateSwSignatureDto {
    flaskSwId: number;
    flaskNeedId: number;
    flaskChildId: number;
    signerAddress: string;
}
