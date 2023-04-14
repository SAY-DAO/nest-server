export class CreateReceiptDto {
    id: number;
    need_id: number;
    sw_id: number;
    receipt_id: number;
    deleted: number;
    receipt: Receipt[];}

export class Receipt {
  id: number;
  owner_id?: number;
  need_id: number;
  attachment: string;
  need_status?: number;
  description?: string;
  title?: string;
  code?: string;
  deleted?: Date;
}
