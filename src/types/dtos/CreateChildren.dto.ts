import { IsNotEmpty } from 'class-validator'
import { EducationEnum, HousingEnum } from '../interface';
export class CreateChildrenDto {
    childData: CreateChildDto[];
}

export class CreateChildDto {
    childId: number;
    @IsNotEmpty()
    awakeAvatarUrl: string;
    @IsNotEmpty()
    bio: string;
    bioSummary: string;
    bioSummaryTranslations: { en: string, fa: string }
    bioTranslations: { en: string, fa: string }
    birthDate: Date;
    birthPlace: string;
    @IsNotEmpty()
    city: number;
    confirmDate: Date;
    confirmUser: number;
    country: number;
    created: Date;
    doneNeedsCount: number;
    education: EducationEnum;
    existence_status: number;
    familyCount: number;
    generatedCode: string;
    housingStatus: HousingEnum;
    ngoId: number;
    flaskSwId: number;
    isConfirmed: boolean;
    isDeleted: boolean;
    isMigrated: boolean;
    isGone: boolean;
    migrateDate: Date;
    migratedId: number;
    nationality: string;
    phoneNumber: string;
    sayFamilyCount: number;
    sayName: string;
    sayNameTranslations: { en: string, fa: string }
    sleptAvatarUrl: string;
    status: number;
    updated: Date;
    voiceUrl: string;
    avatarUrl: string;

}
