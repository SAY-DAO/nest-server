export const SAY_DAPP_ID = 208;
export const SUPER_ADMIN_ID = 25;
export enum eEthereumNetworkChainId {
  mainnet = 1,
  goerli = 5,
  sepolia = 11155111,
}
export enum VirtualFamilyRole {
  SAY = -2,
  FATHER = 0,
  MOTHER = 1,
  AMOO = 2,
  KHALEH = 3,
  DAEI = 4,
  AMME = 5,
}

export enum Colors {
  WHITE = 0,
  BLUE = 1,
  YELLOW = 2,
  RED = 3,
}

export enum SexEnum {
  FEMALE = 1,
  MALE = 2,
}
export enum AnnouncementEnum {
  ERROR = -1,
  NONE = 0,
  ARRIVED_AT_NGO = 1,
  NGO_RECEIVED_MONEY = 2,
}

export enum FlaskUserTypesEnum {
  NO_ROLE = 0,
  SUPER_ADMIN = 1,
  SOCIAL_WORKER = 2,
  COORDINATOR = 3,
  NGO_SUPERVISOR = 4,
  SAY_SUPERVISOR = 5,
  ADMIN = 6,
  FAMILY = 7,
  RELATIVE = 8,
}

export enum PanelContributors {
  NO_ROLE = 0,
  SOCIAL_WORKER = 1,
  NGO_SUPERVISOR = 2,
  PURCHASER = 3,
  AUDITOR = 4,
}
export enum AppContributors {
  FAMILY = 7,
  RELATIVE = 8,
}
export enum SAYPlatformRoles {
  NGO = -2,
  CHILD = -1,
  NO_ROLE = 0,
  SOCIAL_WORKER = PanelContributors.SOCIAL_WORKER,
  NGO_SUPERVISOR = PanelContributors.NGO_SUPERVISOR,
  PURCHASER = PanelContributors.PURCHASER,
  AUDITOR = PanelContributors.AUDITOR,
  FAMILY = AppContributors.FAMILY,
  RELATIVE = AppContributors.RELATIVE,
}

export enum ChildExistence {
  DEAD = 0,
  AlivePresent = 1,
  AliveGone = 2,
  TempGone = 3,
}

export enum ChildConfirmation {
  NOT_CONFIRMED = 0,
  CONFIRMED = 1,
  BOTH = 2,
}

export interface AuthenticationType {
  token: string;
  sayRole: SAYPlatformRoles;
  flaskUserType: FlaskUserTypesEnum;
  createdAt: Date;
  isExpired: boolean;
}

export interface HeaderOptions {
  accessToken: string;
  X_SKIP?: number;
  X_TAKE?: number;
}
export interface NeedApiParams {
  createdBy?: number;
  confirmedBy?: number;
  purchasedBy?: number;
  isConfirmed?: boolean;
  isDone?: boolean;
  isReported?: boolean;
  status?: string;
  type?: number;
  ngoId?: number;
  isChildConfirmed?: boolean;
  unpayable?: boolean;
  options?: any;
}

export interface ChildApiParams {
  confirm: number;
  ngoId?: any;
  swId?: any;
  existenceStatus?: any;
  options?: any;
}

export interface Domain {
  name: string;
  version: string;
  verifyingContract: string;
  chainId: number;
}

export interface SwSignatureResult {
  message: SwProductVoucher | SwServiceVoucher;
  types: any;
  domain: Domain;
  sayRoles: SAYPlatformRoles[];
}

export interface SwServiceVoucher {
  needId: number;
  title: string;
  category: CategoryDefinitionPersianEnum;
  child: string;
  paid: number;
  bankTrackId: string;
  receipts: number;
  signer: string;
  role: string;
  content: string;
}

export interface serviceSignatureTypes {
  readonly Voucher: readonly [
    { readonly name: 'title'; readonly type: 'string' },
    { readonly name: 'category'; readonly type: 'string' },
    { readonly name: 'paid'; readonly type: 'uint256' },
    { readonly name: 'child'; readonly type: 'string' },
    { readonly name: 'bankTrackId'; readonly type: 'string' },
    { readonly name: 'receipts'; readonly type: 'uint256' },
    { readonly name: 'role'; readonly type: 'string' },
    { readonly name: 'content'; readonly type: 'string' },
  ];
}

export interface productSignatureTypes {
  readonly Voucher: readonly [
    { readonly name: 'needId'; readonly type: 'uint256' },
    { readonly name: 'title'; readonly type: 'string' },
    { readonly name: 'category'; readonly type: 'string' },
    { readonly name: 'paid'; readonly type: 'uint256' },
    { readonly name: 'deliveryCode'; readonly type: 'string' },
    { readonly name: 'child'; readonly type: 'string' },
    { readonly name: 'role'; readonly type: 'string' },
    { readonly name: 'content'; readonly type: 'string' },
  ];
}
export interface ServiceSignatureTypes {
  needId: number;
  title: string;
  category: CategoryDefinitionPersianEnum;
  child: string;
  paid: number;
  bankTrackId: string;
  receipts: number;
  signer: string;
  role: string;
  content: string;
}

export interface SwProductVoucher {
  needId: number;
  title: string;
  category: CategoryDefinitionPersianEnum;
  paid: number;
  deliveryCode: string;
  child: string;
  signer: string;
  role: string;
  content: string;
}

export interface FamilyVoucher {
  userId: number;
  childId: number;
  signerAddress: string;
  content: string;
}

/*   
---- PAYMENT-----
partial payment status = 1
complete payment status = 2

---- PRODUCT ---type = 1---
complete purchase for product status = 3
complete delivery for product to NGO status = 4
complete delivery to child status = 5

----- SERVICE ---type = 0---
complete money transfer to NGO for service status = 3
complete delivery to child for service status = 4
*/

export enum PreRegisterStatusEnum {
  NOT_REGISTERED = 0,
  PRE_REGISTERED = 1,
  CONFIRMED = 2,
}

export enum PaymentStatusEnum {
  NOT_PAID = 0,
  PARTIAL_PAY = 1,
  COMPLETE_PAY = 2,
}

export enum ServiceStatusEnum {
  PARTIAL_PAY = PaymentStatusEnum.PARTIAL_PAY,
  COMPLETE_PAY = PaymentStatusEnum.COMPLETE_PAY,
  MONEY_TO_NGO = 3,
  DELIVERED = 4,
}

export enum ProductStatusEnum {
  PARTIAL_PAY = PaymentStatusEnum.PARTIAL_PAY,
  COMPLETE_PAY = PaymentStatusEnum.COMPLETE_PAY,
  PURCHASED_PRODUCT = 3,
  DELIVERED_TO_NGO = 4,
  DELIVERED = 5,
}

export enum CategoryEnum {
  GROWTH = 0,
  JOY = 1,
  HEALTH = 2,
  SURROUNDING = 3,
}

export enum SchoolTypeEnum {
  DEAF = 6,
  BLIND = 7,
  DOWN_SYNDROME = 8,
  PUBLIC = 9,
}

//  -3:Deprived of education | -2:Kindergarten | -1:Not attending | 0:Pre-school | 1:1st grade | 2:2nd grade | ... | 13:University
export enum EducationEnum {
  DEPRIVED = -3,
  KINDERGARTEN = -2,
  NOT_ATTENDING = -1,
  PRE_SCHOOL = 0,
  FIRST_GRADE = 1,
  SECOND_GRADE = 2,
  THIRD_GRADE = 3,
  FOURTH_GRADE = 4,
  FIVE_GRADE = 5,
  SIX_GRADE = 6,
  SEVEN_GRADE = 7,
  EIGHT_GRADE = 8,
  NINE_GRADE = 9,
  TEN_GRADE = 10,
  ELEVEN_GRADE = 11,
  TWELVE_GRADE = 12,
  THIRTEEN_GRADE = 13,
}

// 0:homeless | 1:Resident| 2:Care centers
export enum HousingEnum {
  HOMELESS = 0,
  RESIDENT = 1,
  CARE_CENTERS = 2,
}

export enum CategoryDefinitionEnum {
  GROWTH = 'Growth',
  JOY = 'Joy',
  HEALTH = 'Health',
  SURROUNDING = 'Surrounding',
}

export enum CategoryDefinitionPersianEnum {
  GROWTH = 'رشد',
  JOY = 'تفریح',
  HEALTH = 'سلامت',
  SURROUNDING = 'پیرامون',
}
export enum NeedTypeEnum {
  SERVICE = 0,
  PRODUCT = 1,
}

export enum NeedTypeDefinitionEnum {
  SERVICE = 'Service',
  PRODUCT = 'Product',
}

export enum CampaignNameEnum {
  MONTHLY_CAMPAIGNS = 'MONTHLY_CAMPAIGNS',
  CHILD_CONFIRMATION = 'CHILD_CONFIRMATION',
}

export enum CampaignTypeEnum {
  EMAIL = 1,
  SMS = 2,
}
