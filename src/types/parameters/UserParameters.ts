import { NeedEntity } from "../../entities/need.entity";
import { PaymentEntity } from "../../entities/payment.entity";

export type UserParams = {
    createdAt?: Date;
    updatedAt?: Date;
    userId: number;
    avatarUrl?: string;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
}

export class CreateParticipantDto {
    id_user: number;
    user_avatar: string;
}

