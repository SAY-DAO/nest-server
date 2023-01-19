/**
 * Schema
 * @summary need object
 * @authorization : Sw, ngo_supervisor, Admin, Super_admin, coordinator
 * @Query createdBy, confirmedBy, purchasedBy, virtual Family user_id (for families Do not return Child critical info)
 * @memberof NeedAPI
 */

export interface Need {
  id: number;
  createdBy: number;
  confirmedBy: number;
  purchasedBy: number;
  name_translations: { en: string; fa: string };
  name: string;
  title: string;
  description_translations: { en: string; fa: string };
  description: string;
  details: string;
  imageUrl: string;
  category: number;
  type: number;
  isUrgent: boolean;
  link: string;
  affiliateLinkUrl: string;
  doing_duration: number;
  img: string;
  paid: number;
  purchase_cost: number;
  cost: number;
  unpayable: boolean;
  isDone: boolean;
  isDeleted: boolean;
  isConfirmed: boolean;
  unpayable_from: Date;
  created: Date;
  updated: Date;
  confirmDate: Date;
  deleted_at: Date;
  ngoId: number;
  child: object; //child_id, sayName, firstName, LastName, age, awakeAvatar
  status: object[]; // user_id of whoever update status, status_id, ngo_bank_transfer_id, expected_delivery_date,purchase_date,ngo_delivery_date,child_delivery_date, DoneAt,..
  receipts: object[]; // Date, image, description, title (Dkc || product/service code)
  payments: object[]; // isVerified, bank_track_id, user_id
  participants: object[]; // user_id, role, date of last contribution for same child
};

/**
 * Returns information of /api/user/page
 * @summary get all organized needs
 * @memberof NeedAPI
 */
const needs = {
  'paid': ['need.status = Complete Payment'],
  'purchased/NGo moeny': ['need.status = product: 4, serivce:3'],
  "Delivered": ['need.status = product: 5, serivce:4'],
  // "Signed/Mined": ['this is handled from Nest js']
}

