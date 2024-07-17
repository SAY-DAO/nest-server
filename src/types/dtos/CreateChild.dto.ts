import { IsNotEmpty } from 'class-validator';
import {
  EducationEnum,
  HousingEnum,
  SchoolTypeEnum,
  SexEnum,
} from '../interfaces/interface';

export class UpdateApprovedPreRegisterDto {
  addedState: number;
  id: number;
  id_ngo: number;
  id_social_worker: number;
  firstName_translations: { en: string; fa: string };
  lastName_translations: { en: string; fa: string };
  sayname_translations: { en: string; fa: string };
  phoneNumber: string;
  nationality: string;
  country: number;
  city: number;
  awakeAvatarUrl: string;
  sleptAvatarUrl: string;
  gender: boolean;
  bio_translations: { en: string; fa: string };
  bio_summary_translations: { en: string; fa: string };
  sayFamilyCount: number;
  voiceUrl: string;
  birthPlace: Date;
  birthDate: Date;
  address: string;
  housingStatus: HousingEnum;
  familyCount: number;
  education: EducationEnum;
  avatarUrl: string;
}

export class CreateFlaskChildDto {
  @IsNotEmpty()
  firstNameEn: string;
  @IsNotEmpty()
  lastNameEn: string;
  @IsNotEmpty()
  bioEn: string;
}

export class PreparePreRegisterChildDto {
  @IsNotEmpty()
  bio: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  country: number;
  @IsNotEmpty()
  city: number;
  @IsNotEmpty()
  state: number;
  @IsNotEmpty()
  birthPlaceId: number;
  @IsNotEmpty()
  familyCount: number;
  @IsNotEmpty()
  educationLevel: EducationEnum;
  @IsNotEmpty()
  schoolType: SchoolTypeEnum;
  @IsNotEmpty()
  sex: SexEnum;
  @IsNotEmpty()
  phoneNumber: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  housingStatus: HousingEnum;
  @IsNotEmpty()
  birthDate: Date;
  @IsNotEmpty()
  ngoId: number;
  @IsNotEmpty()
  swId: number;
}

export class UpdatePreRegisterChildDto {
  flaskChildId: number;
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  bio: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsNotEmpty()
  educationLevel: EducationEnum;
  @IsNotEmpty()
  schoolType: SchoolTypeEnum;
  @IsNotEmpty()
  housingStatus: HousingEnum;
}
