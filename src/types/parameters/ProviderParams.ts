import { NeedTypeDefinitionEnum, NeedTypeEnum } from "../interfaces/interface";

export type ProviderParams = {
    name: string;
    description: string;
    address: string;
    website: string;
    type: NeedTypeEnum;
    typeName: NeedTypeDefinitionEnum;
    city: number;
    state: number;
    country: number;
    logoUrl: string;
    isActive: boolean;
}
