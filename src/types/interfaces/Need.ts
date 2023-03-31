import { IpfsEntity } from "src/entities/ipfs.entity";
import { SignatureEntity } from "src/entities/signature.entity";
import { TicketEntity } from "src/entities/ticket.entity";
import { SwmypageReceipts_, SwmypageStatusUpdates, SwmypageVerifiedPayments } from "src/generated-sources/openapi";

export interface NeedsData {
  all_needs_count: number;
  totalCount: number;
  needs: Need[];
}

export interface ChildNeed {
  id?: number;
  ipfsHash?: string;
  ipfsUrl?: string;
  createdById?: number;
  nameTranslations?: any;
  name?: string;
  title?: string;
  descriptionTranslations?: any;
  description?: string;
  details?: string;
  imageUrl?: string;
  category?: number;
  type?: number;
  isUrgent?: boolean;
  link?: string;
  affiliateLinkUrl?: string;
  doingDuration?: number;
  status?: number;
  img?: string;
  paid?: number;
  purchaseCost?: number;
  cost?: number;
  unpayable?: boolean;
  isDone?: boolean;
  isDeleted?: boolean;
  isConfirmed?: boolean;
  unpayableFrom?: Date;
  created?: Date;
  updated?: Date;
  confirmDate?: Date;
  deletedAt?: Date;
  statusUpdates?: SwmypageStatusUpdates[];
  receipts_?: SwmypageReceipts_[];
  verifiedPayments?: SwmypageVerifiedPayments[];
  confirmedBy?: number;
  doneAt?: Date;
  ngoDeliveryDate?: Date;
  childDeliveryDate?: Date;
  purchaseDate?: Date;
  child: {
    id: number;
    sayName: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    awakeAvatarUrl: string;
  };
  ticket: TicketEntity,
  signatures?: SignatureEntity[];
  ipfs?: IpfsEntity
};

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
  receipt: Receipt[]
};

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
}

export interface Payment {
  id: number
  id_need: number
  id_user: number
  cart_payment_id: number
  gateway_payment_id: number
  gateway_track_id: string
  link: string
  order_id: string
  desc: string
  card_no: string
  hashed_card_no: string
  transaction_date: string
  verified: string
  is_nakama: boolean
  need_amount: number
  credit_amount: number
  donation_amount: number
  bank_amount: number
  total_amount: number
  created: Date;
  updated: Date
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
