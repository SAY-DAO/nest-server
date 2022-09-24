import { NeedEntity } from "../need.entity";
import { PaymentEntity } from "../payment.entity";


export interface UserInterface {
    createdAt?: Date;
    updatedAt?: Date;
    userId: number;
    avatarUrl?: string;
    isActive?: boolean;
    doneNeeds?: NeedEntity[]
    payments?: PaymentEntity[]
}

