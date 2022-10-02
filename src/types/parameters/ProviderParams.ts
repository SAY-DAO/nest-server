import { NeedTypeEnum } from "../interface";

export type ProviderParams = {
    name: string;
    description: string;
    website: string;
    type: NeedTypeEnum;
    city: number;
    state: number;
    country: number;
    logoUrl: string;
}
