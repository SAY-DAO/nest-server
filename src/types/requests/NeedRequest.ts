import { UserEntity } from "../../entities/user.entity";

export class NeedRequest {
  totalCount: number;
  needData: Need[];
}

// need from panel - flask server
export class Need {
  id: string;
  need_id: number;
  title: string;
  affiliateLinkUrl?: string;
  bank_track_id?: string | null;
  category: number;
  childGeneratedCode: string;
  childSayName: string;
  child_delivery_date?: Date | null;
  child_id: number;
  confirmDate: Date | null;
  confirmUser?: number;
  cost: number;
  created: Date | null;
  created_by_id: number;
  deleted_at?: Date | null;
  description: string;
  description_translations?: { en: string, fa: string }
  details?: string;
  doing_duration?: number;
  donated?: number;
  doneAt?: Date | null;
  expected_delivery_date: Date | null;
  imageUrl?: string;
  need_retailer_img?: string;
  informations?: string;
  isConfirmed: boolean;
  isDeleted: boolean;
  isDone: boolean;
  isReported: boolean;
  isUrgent: boolean;
  is_done?: boolean;
  link?: string;
  title_translations?: { en: string, fa: string }
  ngoAddress?: string;
  ngoId: number;
  ngoName: string;
  ngo_delivery_date: Date | null;
  oncePurchased?: boolean;
  paid?: number;
  payments: []
  progress: string;
  purchase_cost: any;
  purchase_date: Date | null;
  receipt_count: number;
  receipts: any;
  status: number;
  status_description: any;
  status_updated_at: Date | null;
  type: number;
  type_name: string;
  unavailable_from: Date | null;
  unconfirmed_at: Date | null;
  unpaid_cost?: number;
  unpayable: boolean;
  unpayable_from?: Date | null;
  updated?: Date;
  participants: UserEntity[]
}


