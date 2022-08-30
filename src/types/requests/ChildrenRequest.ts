export class ChildrenRequest {
    childData: Children[];
    totalChildCount: number;
}

export class Children {
    address: string;
    awakeAvatarUrl: string;
    bio: string;
    bioSummary: string;
    bio_summary_translations: { en: string, fa: string }
    bio_translations: { en: string, fa: string }
    birthDate: Date;
    birthPlace: string;
    city: number;
    confirmDate: Date;
    confirmUser: number;
    country: number;
    created: Date;
    done_needs_count: number;
    education: string;
    existence_status: number;
    familyCount: number;
    gender: boolean;
    generatedCode: string;
    housingStatus: string;
    child_id: number;
    id_ngo: number;
    id_social_worker: number;
    isConfirmed: boolean;
    isDeleted: boolean;
    isMigrated: boolean;
    is_gone: boolean;
    migrateDate: Date;
    migratedId: number;
    nationality: string;
    phoneNumber: string;
    sayFamilyCount: number;
    sayName: string;
    sayname_translations: { en: string, fa: string }
    sleptAvatarUrl: string;
    status: number;
    updated: string;
    voiceUrl: string;
    avatarUrl: string;

}
