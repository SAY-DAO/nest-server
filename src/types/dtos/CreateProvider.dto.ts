import { NeedTypeDefinitionEnum } from '../interface';

export class CreateProviderDto {
    name: string;
    description: string;
    website: string;
    type: number;
    typeName: NeedTypeDefinitionEnum;
    city: number;
    state: number;
    country: number;
    logoUrl: ImageData;
    isActive: boolean
}
