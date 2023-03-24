import { ContributorEntity } from "src/entities/contributor.entity";

export type NgoParams = {
    flaskNgoId?: number;
    socialWorkers?: ContributorEntity[];
    name?: string;
    website?: string;
    cityId?: number
    stateId?: number
    countryId?: number;
    logoUrl?: string;
    isActive?: boolean
    isDeleted?: boolean
    socialWorkerCount?: number
    currentSocialWorkerCount?: number
    childrenCount?: number
    currentChildrenCount?: number
    postalAddress?: string
    emailAddress?: string
    phoneNumber?: string
    balance?: number
    registerDate?: Date;
    updated: Date,
}
