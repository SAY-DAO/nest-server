import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";
import { SAYPlatformRoles } from "../interface";
import { EthereumAccount } from "src/entities/ethereum.account.entity";
import { ChildrenEntity } from "src/entities/children.entity";


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
    birthDate: Date
    flaskId: number
    flaskNgoId?: number;
    typeId?: number;
    children?: ChildrenEntity[];
    createdNeeds?: NeedEntity[];
    auditedNeeds?: NeedEntity[];
    purchasedNeeds?: NeedEntity[];
    ngo?: NgoEntity;
    wallet?: EthereumAccount;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    created?: Date;
    updated?: Date;
    role: SAYPlatformRoles
}

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

