import { NgoEntity } from "../../entities/ngo.entity";
import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";
import { SAYPlatformRoles } from "../interfaces/interface";
import { EthereumAccountEntity } from "src/entities/ethereum.account.entity";
import { ChildrenEntity } from "src/entities/children.entity";


export type UserParams = {
    createdAt?: Date;
    flaskId: number;
    typeId?: number,
    updatedAt?: Date;
    birthDate?: Date
    flaskUserId?: number;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
    wallet?: EthereumAccountEntity;
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

