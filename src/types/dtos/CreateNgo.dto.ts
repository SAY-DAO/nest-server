import { IsNotEmpty } from "class-validator";

export class PreparePreRegisterNgoDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    swPhoneNumber: number;
    @IsNotEmpty()
    phoneNumber: number;
    @IsNotEmpty()
    emailAddress: string;
    website: string;
    @IsNotEmpty()
    postalAddress: string;
    @IsNotEmpty()
    country: number;
    @IsNotEmpty()
    state: number;
    @IsNotEmpty()
    city: number;
    @IsNotEmpty()
    firstName: string
    @IsNotEmpty()
    lastName: string
};