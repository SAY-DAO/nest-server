import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { EducationEnum, HousingEnum } from "../interface";

export type ChildParams = {
    flaskChildId: number;
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
    education?: EducationEnum;
    existence_status?: number;
    familyCount?: number;
    generatedCode?: string;
    housingStatus?: HousingEnum;
    ngo: NgoEntity;
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

