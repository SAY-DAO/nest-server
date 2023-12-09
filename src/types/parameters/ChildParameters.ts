import {
  EducationEnum,
  HousingEnum,
  PreRegisterStatusEnum,
  SchoolTypeEnum,
} from '../interfaces/interface';

export type ChildParams = {
  flaskId: number;
  sayNameTranslations: Record<string, string>;
  sayName: string;
  phoneNumber?: string;
  nationality?: number;
  country?: number;
  city?: number;
  awakeAvatarUrl: string;
  sleptAvatarUrl: string;
  adultAvatarUrl?: string;
  bioSummaryTranslations?: Record<string, string>;
  bioTranslations?: Record<string, string>;
  voiceUrl?: string;
  birthPlace?: string;
  birthDate?: Date;
  housingStatus?: number;
  familyCount?: number;
  sayFamilyCount?: number;
  education?: number;
  status?: number;
  spentCredit?: number;
  created?: Date;
  updated?: Date;
  isDeleted?: boolean;
  isConfirmed?: boolean;
  flaskConfirmUser?: number;
  confirmDate?: Date;
  generatedCode?: string;
  isMigrated?: boolean;
  migratedId?: number;
  migrateDate?: Date;
};
export type createFlaskChildParams = {
  awakeAvatarUrl: any;
  sleptAvatarUrl: any;
  voiceUrl: any;
  saynameTranslations: any;
  bioTranslations: any;
  bioSummaryTranslations: any;
  phoneNumber: string;
  country: number;
  city: number;
  gender: boolean;
  ngoId?: number;
  swId?: number;
  firstNameTranslations?: any;
  lastNameTranslations?: any;
  nationalityId?: number;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  housingStatus?: HousingEnum;
  familyCount?: number;
  education?: number;
};

export type PreRegisterChildPrepareParams = {
  phoneNumber: string;
  address: string;
  country: number;
  state: number;
  city: number;
  status: PreRegisterStatusEnum;
  bio: { fa: string; en: string };
  voiceUrl: string;
  birthPlaceId: number;
  flaskChildId?: number;
  birthPlaceName: string;
  birthDate: Date;
  housingStatus: HousingEnum;
  familyCount: number;
  educationLevel: EducationEnum;
  schoolType: SchoolTypeEnum;
  flaskNgoId: number;
  flaskSwId: number;
  firstName: { fa: string; en: string };
  lastName: { fa: string; en: string };
};

export type PreRegisterChildUpdateParams = {
  bio: { fa: string; en: string };
  housingStatus: HousingEnum;
  educationLevel: EducationEnum;
  schoolType: SchoolTypeEnum;
  firstName: { fa: string; en: string };
  lastName: { fa: string; en: string };
};
