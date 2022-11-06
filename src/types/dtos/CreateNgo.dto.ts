
export class CreateNgoDto {
    id: number
    name: string;
    website: string;
    city: number
    state: number
    country: number;
    logoUrl: ImageData;
    isActive: boolean
    isDeleted: number
    socialWorkerCount: number
    currentSocialWorkerCount: number
    childrenCount: number
    currentChildrenCount: number
    postalAddress: string
    emailAddress: string
    phoneNumber: string
    balance: number
    registerDate: Date;
}



