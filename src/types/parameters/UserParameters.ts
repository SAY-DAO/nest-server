import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";
import { PanelContributors } from "../interfaces/interface";
import { EthereumAccountEntity } from "src/entities/ethereum.account.entity";


export type UserParams = {
    createdAt?: Date;
    typeId?: number,
    updatedAt?: Date;
    birthDate?: Date
    flaskUserId: number;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
    wallet?: EthereumAccountEntity;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    created?: Date;
    updated?: Date;
    panelRole?: PanelContributors,
    need?: NeedEntity
}

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

