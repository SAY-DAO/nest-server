import { IsNotEmpty } from 'class-validator';
import {
  EducationEnum,
  HousingEnum,
  SchoolTypeEnum,
  SexEnum,
} from '../interfaces/interface';

export class CreateChildrenDto {
  /**
   * @memberof SwmypageInner
   */
  id?: number;
  sayName?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  awakeAvatarUrl?: string;
}

export class CreateFlaskChildDto {
  @IsNotEmpty()
  firstNameEn: string;
  @IsNotEmpty()
  lastNameEn: string;
  @IsNotEmpty()
  bioEn: string;
}

export class UpdatePreRegisterChildDto {
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
