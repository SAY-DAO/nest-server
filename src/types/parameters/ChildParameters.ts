export type ChildParams = {
    flaskId: number;
    sayNameTranslations: Record<string, string>;
    sayName: string;
    phoneNumber?: string;
    nationality?: number;
    country?: number;
    city?: number;
    awakeAvatarUrl: string;
    sleptAvatarUrl: string;
    adultAvatarUrl?: string;
    bioSummaryTranslations?: Record<string, string>;
    bioTranslations?: Record<string, string>;
    voiceUrl?: string;
    birthPlace?: string;
    birthDate?: Date;
    housingStatus?: number;
    familyCount?: number;
    sayFamilyCount?: number;
    education?: number;
    status?: number;
    spentCredit?: number;
    created?: Date;
    updated?: Date;
    isDeleted?: boolean;
    isConfirmed?: boolean;
    flaskConfirmUser?: number;
    confirmDate?: Date;
    generatedCode?: string;
    isMigrated?: boolean;
    migratedId?: number;
    migrateDate?: Date;
}

