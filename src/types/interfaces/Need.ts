import { IpfsEntity } from 'src/entities/ipfs.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import {
  SwmypageReceipts_,
  SwmypageStatusUpdates,
  SwmypageVerifiedPayments,
} from 'src/generated-sources/openapi';
import { SAYPlatformRoles } from './interface';

export interface NeedsData {
  all_needs_count: number;
  totalCount: number;
  needs: Need[];
}

export interface ChildNeed {
  title: string;
  imageUrl: string;
  img: string;
  name_translations: Record<string, string>;
  doing_duration: number;
  affiliateLinkUrl?: string;
  bank_track_id?: string;
  category: number;
  child_delivery_date?: Date;
  confirmDate?: Date;
  _cost: number;
  description_translations: Record<string, string>;
  details: string;
  informations: string;
  doneAt: Date;
  expected_delivery_date: Date;
  isConfirmed: boolean;
  isDeleted: boolean;
  isUrgent: boolean;
  link: string;
  ngo_delivery_date: Date;
  purchase_cost: number;
  purchase_date: Date;
  status: number;
  status_updated_at: Date;
  type: number;
  unavailable_from?: Date;
  unconfirmed_at?: Date;
  created: Date;
  updated?: Date;
  deleted_at?: Date;
  child_id: number;
  created_by_id: number;
  confirmUser: number;
  id: number;
  child: {
    id: number;
    sayName: Record<string, string>;
    firstName: Record<string, string>;
    lastName: Record<string, string>;
    birthDate: Date;
    awakeAvatarUrl: string;
  };
  ticket: TicketEntity;
  ipfs: IpfsEntity;
}

export interface Need {
  id: number;
  child_id: number;
  created_by_id: number;
  name_translations: { en: string; fa: string };
  name: string;
  description_translations: { en: string; fa: string };
  description: string;
  imageUrl: string;
  category: number;
  isUrgent: boolean;
  details: string;
  informations: string;
  purchase_cost: number;
  link: string;
  affiliateLinkUrl: string;
  isDeleted: boolean;
  receipts: null;
  isConfirmed: boolean;
  confirmUser: number;
  type: number;
  doing_duration: number;
  status: number;
  status_updated_at: Date;
  isReported: boolean;
  img: string;
  title: string;
  oncePurchased: boolean;
  bank_track_id: string;
  unavailable_from: Date;
  doneAt: Date;
  purchase_date: Date;
  dkc: string;
  expected_delivery_date: Date;
  ngo_delivery_date: Date;
  child_delivery_date: Date;
  confirmDate: Date;
  deleted_at: Date;
  unconfirmed_at: Date;
  paid: number;
  donated: number;
  receipt_count: number;
  childSayName: string;
  cost: number;
  unpaid_cost: number;
  pretty_cost: string;
  pretty_paid: string;
  pretty_donated: string;
  unpayable: boolean;
  unpayable_from: null;
  progress: number;
  isDone: boolean;
  is_done: boolean;
  clean_title: string;
  type_name: string;
  status_description: string;
  created: Date;
  updated: Date;
  ngoId: 1;
  ngoName: string;
  ngoAddress: string;
  childGeneratedCode: string;
  childFirstName: string;
  childLastName: string;
  payments: Payment[];
  receipt: Receipt[];
}

export type Receipt = {
  title: string;
  description: string;
  attachment: string;
  isPublic: boolean;
  code: string;
  flaskSwId: number;
  socialWorker: number;
  child: number;
  needStatus: number;
  flaskReceiptId: number;
  deleted: boolean | null;
  flaskNeedId: number;
};

export interface Payment {
  id: number;
  id_need: number;
  id_user: number;
  cart_payment_id: number;
  gateway_payment_id: number;
  gateway_track_id: string;
  link: string;
  order_id: string;
  desc: string;
  card_no: string;
  hashed_card_no: string;
  transaction_date: string;
  verified: string;
  is_nakama: boolean;
  need_amount: number;
  credit_amount: number;
  donation_amount: number;
  bank_amount: number;
  total_amount: number;
  created: Date;
  updated: Date;
}

/**
 *
 * @type {string}
 * @memberof NeedModel from generated codes
 */
export interface NeedSummary {
  id?: number;
  name?: string;
  imageUrl?: string;
  category?: number;
  isUrgent?: boolean;
  description?: string;
  descriptionSummary?: string;
  cost?: number;
  progress?: number;
  paid?: number;
  affiliateLinkUrl?: string;
  isDone?: boolean;
  isDeleted?: boolean;
  created?: string;
  receipts?: string;
  isConfirmed?: boolean;
  confirmDate?: string;
  confirmUser?: number;
  type?: number;
  updated?: string;
  details?: string;
  informations?: string;
}

export class CreateParticipantDto {
  id_user: number;
  user_avatar: string;
}

export class ValidatedDupType {
  validation: {
    needId: number;
    dupId: number;
    C: boolean | null;
    T: boolean | null;
    R: boolean | null;
    P: boolean | null;
    I: boolean | null;
    N: boolean | null;
    D: boolean | null;
    A: boolean | null;
    titleResult: number | null;
    isValidNeed: boolean | null;
    isValidDuplicate: boolean | null;
    ageOfDup: number;
    msg: string;
    status: number;
    TT?: boolean | null;
  };

  title: string;
  imageUrl: string;
  img: string;
  name_translations: Record<string, string>;
  doing_duration: number;
  affiliateLinkUrl?: string;
  bank_track_id?: string; // when confirming a need 4 duplicates are allow for the category 0
  category: number;
  child_delivery_date?: Date;
  confirmDate?: Date;
  _cost: number;
  description_translations: Record<string, string>;
  details: string;
  informations: string;
  doneAt: Date;
  expected_delivery_date: Date;
  isConfirmed: boolean;
  isDeleted: boolean;
  isUrgent: boolean;
  link: string;
  ngo_delivery_date: Date;
  purchase_cost: number;
  purchase_date: Date;
  status: number;
  status_updated_at: Date;
  type: number;
  unavailable_from?: Date;
  unconfirmed_at?: Date;
  created: Date;
  updated?: Date;
  deleted_at?: Date;
  child_id: number;
  deliveryCode: string;
  created_by_id: number;
  confirmUser: number;
  id: number;
}
