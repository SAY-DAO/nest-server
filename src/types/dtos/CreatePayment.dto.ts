import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  id?: number;
  verified?: Date;
  id_need: number;
  id_user: number;
  order_id: string;
  credit_amount: number;
  donation_amount: number;
  card_no: string;
  gateway_payment_id: string;
  gateway_track_id: string;
  need_amount: number;
  transaction_date: Date;
  created: Date;
  updated: Date;
}

export class CreateFlaskPaymentDto {
  @IsNotEmpty()
  needId: number;
  @IsNotEmpty()
  gateWay: number;
  @IsNotEmpty()
  amount: number;
  @IsNotEmpty()
  donation: number;
  @IsNotEmpty()
  useCredit: boolean;
}


export class CreateFlaskCartPaymentDto {
  @IsNotEmpty()
  gateWay: number;
  @IsNotEmpty()
  donation: number;
  @IsNotEmpty()
  useCredit: boolean;
}

export class VerifyFlaskPaymentDto {
  // idpay
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  order_id: number;
  //  zipal
  @IsNotEmpty()
  trackId: number;
  @IsNotEmpty()
  orderId: number;
}
