import { NeedEntity } from "src/entities/need.entity";
import { FamilyEntity } from "src/entities/user.entity";

export type PaymentParams = {
    flaskId:number
    flaskNeedId:number
    flaskUserId:number
    need?: NeedEntity;
    user?: FamilyEntity;
    verified?: Date;
    needAmount?: number;
    donationAmount?: number;
    creditAmount?: number;
    useCredit?: boolean;
}
