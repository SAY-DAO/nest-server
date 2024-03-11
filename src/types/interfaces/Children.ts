import { EducationEnum, HousingEnum } from './interface';
export class CreateChildrenDto {
    childData: Children[];
}


export class ChildrenData {
    totalCount: number;
    children: Children[]
}

export class Children {
    id: number;
    id_ngo: number;
    id_social_worker: number;
    firstName_translations: { en: string; fa: string };
    firstName: string;
    lastName_translations: { en: string; fa: string };
    lastName: string;
    sayname_translations: { en: string; fa: string };
    sayName: string;
    phoneNumber: string;
    nationality: string;
    country: number;
    city: number;
    awakeAvatarUrl: string;
    sleptAvatarUrl: string;
    gender: boolean;
    bio_translations: { en: string; fa: string };
    bio: string;
    bio_summary_translations: { en: string; fa: string };
    bioSummary: string;
    sayFamilyCount: number;
    voiceUrl: string;
    birthPlace: Date;
    birthDate: Date;
    address: string;
    housingStatus: HousingEnum;
    familyCount: number;
    education: EducationEnum;
    status: number | null;
    existence_status: number;
    isDeleted: boolean;
    isConfirmed: boolean;
    confirmUser: number;
    confirmDate: Date;
    generatedCode: string;
    isMigrated: boolean;
    migratedId: number | null;
    migrateDate: Date | null;
    avatarUrl: string;
    is_gone: boolean;
    done_needs_count: number;
    spent_credit: number;
    created: Date;
    updated: Date
}
