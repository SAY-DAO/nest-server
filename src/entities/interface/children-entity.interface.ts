import { NeedEntity } from "../need.entity";


export interface ChildrenInterface {
    childId: number;
    awakeAvatarUrl?: string;
    bio?: string;
    bioSummary?: string;
    bioSummaryTranslations?: { en: string; fa: string };
    bioTranslations?: { en: string; fa: string };
    birthDate?: Date;
    birthPlace?: string;
    city?: number;
    confirmDate?: Date;
    confirmUser?: number;
    country?: number;
    created?: Date;
    doneNeedsCount?: number;
    education?: string;
    existence_status?: number;
    familyCount?: number;
    generatedCode?: string;
    housingStatus?: string;
    ngoId?: number;
    idSocialWorker?: number;
    isConfirmed?: boolean;
    isDeleted?: boolean;
    isMigrated?: boolean;
    isGone?: boolean;
    migrateDate?: Date;
    migratedId?: number;
    nationality?: string;
    sayFamilyCount?: number;
    sayName?: string;
    sayNameTranslations?: { en: string; fa: string };
    sleptAvatarUrl?: string;
    status?: number;
    updated?: Date;
    voiceUrl?: string;
    needs?: NeedEntity[]
}

