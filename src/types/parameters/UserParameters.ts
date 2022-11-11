import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";


export type FamilyParams = {
    createdAt?: Date;
    updatedAt?: Date;
    flaskUserId?: number;
    avatarUrl?: string;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
}

export type SocialWorkerParams = {
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
    flaskNgoId?: number;
    ngo: NgoEntity;
    typeId?: number; // user type
    gender?: false;
    phoneNumber?: string;
    emergencyPhoneNumber?: string;
    email?: string;
    avatarUrl?: string;
    idCardUrl?: string;
    passportUrl?: string;
    flaskSwId: number;
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

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

