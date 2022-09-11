import { ChildrenEntity } from "../../entities/children.entity";

// need from panel - flask server
export class NeedRequest {
  id: string;
  needId: number;
  title: string;
  affiliateLinkUrl: string;
  bankTrackId: string | null;
  category: number;
  childGeneratedCode: string;
  childSayName: string;
  childDeliveryDate: Date | null;
  childId: number;
  confirmDate: Date | null;
  confirmUser: number;
  cost: number;
  created: Date | null;
  createdById: number;
  deleted_at: Date | null;
  description: string;
  descriptionTranslations: { en: string, fa: string };
  details: string;
  doing_duration: number;
  donated: number;
  doneAt: Date | null;
  expectedDeliveryDate: Date | null;
  imageUrl: string;
  needRetailerImg: string;
  information: string;
  isConfirmed: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  doingDuration: number;
  signatures: [];
  isDeleted: boolean;
  isDone: boolean;
  isReported: boolean;
  isUrgent: boolean;
  is_done: boolean;
  link: string;
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
  receipts: any;
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
  payments: BankPaymentRequest[];
  participants: ParticipantRequest[];
  child: ChildrenEntity;
}

// // need from panel - flask server
export class BankPaymentRequest {
  bank_amount: number;
  card_no: string;
  cart_payment_id: string;
  created: Date | null;
  credit_amount: number;
  desc: string;
  donation_amount: number;
  gateway_payment_id: string;
  gateway_track_id: string;
  hashed_card_no: string;
  id: number;
  id_need: number;
  userId: number;
  link: string;
  need_amount: number;
  order_id: string;
  total_amount: number;
  transaction_date: Date | null;
  updated: Date | null;
  verified: Date | null;
}

export class ParticipantRequest {
  id_user: number;
  user_avatar: string;
}