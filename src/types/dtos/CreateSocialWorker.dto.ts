
export class SocialWorkerDto {
    cityId?: number;
    firstName?: string;
    lastName?: string;
    birthCertificateNumber?: number;
    passportNumber?: number;
    postalAddress?: string;
    bankAccountNumber?: number;
    bankAccountShebaNumber?: number;
    bankAccountCardNumber?: number;
    birthDate?: Date | null;
    telegramId?: string;
    idNumber?: string;
    isCoordinator?: true;
    ngoId?: number;
    typeId?: number; // user type
    gender?: false;
    phoneNumber?: string;
    emergencyPhoneNumber?: string;
    email?: string;
    avatarUrl?: string;
    idCardUrl?: string;
    passportUrl?: string;
    id: number;
    username?: string;
    generatedCode?: string;
    childCount?: number;
    currentChildCount?: number;
    created?: Date | null;
    updated?: Date | null;
    needCount?: number;
    currentNeedCount?: number;
    lastLoginDate?: Date | null;
    isActive?: true;
    isDeleted?: false;
    locale?: string;
    typeName?: string;
    ngoName?: string;
}
