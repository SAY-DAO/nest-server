import { ChildrenEntity } from '../../entities/children.entity';
import { IsNotEmpty } from 'class-validator';
import { CreateReceiptDto } from './CreateReceipt.dto';
import { SocialWorkerDto } from './CreateSocialWorker.dto';
import { CreateChildDto } from './CreateChildren.dto';

export class NeedsDataDto {
  all_needs_count: number;
  totalCount: number;
  needs: NeedDto[]
}


export class NeedDto {
  @IsNotEmpty()
  needId: number;
  @IsNotEmpty()
  title: string;
  affiliateLinkUrl: string;
  link: string;
  bankTrackId: string;
  category: number;
  childGeneratedCode: string;
  childSayName: string;
  childDeliveryDate: Date | null;
  childId: number;
  confirmDate: Date | null;
  confirmUser: number;
  cost: number;
  created: Date | null;
  deleted_at: Date | null;
  description: string;
  descriptionTranslations: { en: string; fa: string };
  details: string;
  doing_duration: number;
  donated: number;
  doneAt: Date | null;
  expectedDeliveryDate: Date | null;
  imageUrl: string;
  needRetailerImg: string;
  information: string;
  isConfirmed: boolean;
  signatures: [];
  isDeleted: boolean;
  isDone: boolean;
  isReported: boolean;
  isUrgent: boolean;
  is_done: boolean;
  titleTranslations: { en: string; fa: string };
  ngoAddress: string;
  ngoId: number;
  ngoName: string;
  ngoDeliveryDate: Date | null;
  oncePurchased: boolean;
  paid: number;
  progress: string;
  purchaseCost: any;
  purchaseDate: Date | null;
  receiptCount: number;
  status: number;
  statusDescription: any;
  statusUpdatedAt: Date | null;
  type: number;
  typeName: string;
  unavailableFrom: Date | null;
  unconfirmedAt: Date | null;
  unpaidCost: number;
  unpayable: boolean;
  unpayableFrom: Date | null;
  updated: Date;
  payments: CreatePaymentDto[];
  receipts: CreateReceiptDto[];
  participants: CreateParticipantDto[];
  child: CreateChildDto;
  created_by_id: number;
}

// // need from panel - flask server
export class CreatePaymentDto {
  bank_amount?: number;
  card_no?: string;
  cart_payment_id?: string;
  created?: Date | null;
  credit_amount?: number;
  desc?: string;
  donation_amount?: number;
  gateway_payment_id?: string;
  gateway_track_id?: string;
  hashed_card_no?: string;
  id?: number;
  id_need?: number;
  id_user?: number;
  link?: string;
  need_amount?: number;
  order_id?: string;
  total_amount?: number;
  transaction_date?: Date | null;
  updated?: Date | null;
  verified?: Date | null;
}

export class CreateParticipantDto {
  id_user: number;
  user_avatar: string;
}
