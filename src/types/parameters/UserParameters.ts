import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";
import { NgoParams } from "./NgoParammeters";
import { SAYPlatformRoles } from "../interface";


export type FamilyParams = {
    createdAt?: Date;
    flaskId: number;
    updatedAt?: Date;
    flaskUserId?: number;
    avatarUrl?: string;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
    role: SAYPlatformRoles
}

export type ContributorParams = {
    cityId?: string;
    stateId?: string
    countryId?: string
    cityName?: string
    stateName?: string
    countryName?: string
    firstName?: string;
    lastName?: string;
    birthCertificateNumber?: string;
    idNumber?: string;
    passportNumber?: string;
    postalAddress?: string;
    bankAccountNumber?: string;
    bankAccountShebaNumber?: string;
    bankAccountCardNumber?: string;
    birthDate?: Date;
    telegramId?: string;
    isCoordinator?: boolean;
    flaskNgoId?: number;
    ngo?: NgoEntity;
    gender?: boolean
    phoneNumber?: string;
    emergencyPhoneNumber?: string;
    email?: string;
    avatarUrl?: string;
    idCardUrl?: string;
    passportUrl?: string;
    flaskId: number;
    username?: string;
    generatedCode?: string;
    childCount?: number;
    currentChildCount?: number;
    created?: Date;
    updated: Date;
    needCount?: number;
    currentNeedCount?: number;
    lastLoginDate?: Date;
    isActive?: boolean;
    isDeleted?: boolean;
    locale?: string;
    typeId?: number; // user type
    typeName?: string;
    ngoName?: string;
    role: SAYPlatformRoles
}

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

