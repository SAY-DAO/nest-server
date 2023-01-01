import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { EducationEnum, HousingEnum } from "../interface";
import { SocialWorkerEntity } from "src/entities/user.entity";

export type ChildParams = {
    flaskChildId: number;
    flaskSupervisorId?: number;
    awakeAvatarUrl?: string;
    bio?: string;
    bioSummary?: string;
    bioSummaryTranslations?: { en: string; fa: string };
    bioTranslations?: { en: string; fa: string };
    birthDate?: Date;
    birthPlace?: string;
    city?: number;
    confirmDate?: Date;
    country?: number;
    created?: Date;
    doneNeedsCount?: number;
    education?: EducationEnum;
    existenceStatus?: number;
    familyCount?: number;
    generatedCode?: string;
    housingStatus?: HousingEnum;
    flaskSwId?: number;
    ngo: NgoEntity;
    socialWorker: SocialWorkerEntity;
    supervisor?: SocialWorkerEntity;
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

