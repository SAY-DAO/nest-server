import { IsNotEmpty } from 'class-validator';
import { EducationEnum, HousingEnum, SexEnum } from '../interfaces/interface';

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

export class CreatePreRegisterChildDto {
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
  education: EducationEnum;
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
