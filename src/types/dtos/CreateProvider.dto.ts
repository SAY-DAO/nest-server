import { NeedTypeDefinitionEnum } from '../interfaces/interface';

export class CreateProviderDto {
    name: string;
    description: string;
    website: string;
    type: string;
    typeName: NeedTypeDefinitionEnum;
    city: number;
    state: number;
    country: number;
    logoUrl: ImageData;
    isActive: boolean
}

export class CreateProviderJoinNeedDto {
    nestProviderId: string;
    flaskNeedId: number;
   
}
