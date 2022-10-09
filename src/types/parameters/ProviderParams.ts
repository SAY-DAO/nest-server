import { NeedTypeDefinitionEnum, NeedTypeEnum } from "../interface";

export type ProviderParams = {
    name: string;
    description: string;
    website: string;
    type: NeedTypeEnum;
    typeName: NeedTypeDefinitionEnum;
    city: number;
    state: number;
    country: number;
    logoUrl: string;
    isActive: boolean;
}
