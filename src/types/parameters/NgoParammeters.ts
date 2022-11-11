import { SocialWorkerEntity } from "src/entities/user.entity";

export type NgoParams = {
    flaskNgoId: number;
    socialWorker?: SocialWorkerEntity;
    name?: string;
    website?: string;
    city?: number
    state?: number
    country?: number;
    logoUrl?: string;
    isActive?: boolean
    isDeleted?: number
    socialWorkerCount?: number
    currentSocialWorkerCount?: number
    childrenCount?: number
    currentChildrenCount?: number
    postalAddress?: string
    emailAddress?: string
    phoneNumber?: string
    balance?: number
    registerDate?: Date;
}
