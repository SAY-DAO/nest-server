import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";
import { RolesEnum } from "../interface";

export type UserParams = {
    createdAt?: Date;
    updatedAt?: Date;
    flaskUserId?: number;
    flaskSwId?: number;
    avatarUrl?: string;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
    role?: RolesEnum
}

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

