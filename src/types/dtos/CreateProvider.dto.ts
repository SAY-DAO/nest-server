import { IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
    name: string;
    description: string;
    website: string;
    type: number;
    city: number;
    state: number;
    country: number;
    logoUrl: ImageData;
}
