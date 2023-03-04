import { NgoEntity } from "src/entities/ngo.entity";

export class CreateSocialWorkerDto {
    id?: number;
    sayName?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    awakeAvatarUrl?: string;
    flaskSwId: number
    birthCertificateNumber: number
    idCardUrl: string
    generatedCode: string
    cityId: number
    city: {
        name: string
        stateId: number
        cityName: string
        stateName: string
        countryId: number
        countryName: string
    }
    ngoId: number
}
