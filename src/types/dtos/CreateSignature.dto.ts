import { IsNotEmpty } from 'class-validator';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { SAYPlatformRoles } from '../interfaces/interface';
import { CreatePaymentDto } from './CreatePayment.dto';
import { CreateReceiptDto } from './CreateReceipt.dto';
import { CreateStatusDto } from './CreateStatus.dto';

export class NeedSignatureMessage {
  @IsNotEmpty()
  domain: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  statement: string;
  @IsNotEmpty()
  uri: string;
  @IsNotEmpty()
  version: string;
  @IsNotEmpty()
  chainId: number;
  @IsNotEmpty()
  nonce: string;
}
export class VerifyWalletDto {
  message: NeedSignatureMessage;
  signature: string;
}

// export class VerifySignatureDto {
//   @IsNotEmpty()
//   signature: string;
//   @IsNotEmpty()
//   message: string;
// }

export class PreparePanelSignatureDto {
  @IsNotEmpty()
  chainId: number;
  @IsNotEmpty()
  flaskNeedId: number;
  statuses?: CreateStatusDto[];
  receipts?: CreateReceiptDto[];
  @IsNotEmpty()
  arrivedColumnNumber: number;
  @IsNotEmpty()
  payments?: CreatePaymentDto[];
}

export class VerifySignatureDto {
  @IsNotEmpty()
  chainId: number;
  @IsNotEmpty()
  flaskNeedId: number;
}

export class PrepareDappSignatureDto {
  @IsNotEmpty()
  chainId: number;
  @IsNotEmpty()
  needId: string;
}

export class CreateSignatureDto {
  @IsNotEmpty()
  sayRoles: SAYPlatformRoles[];
  @IsNotEmpty()
  flaskNeedId: number;
  @IsNotEmpty()
  verifyVoucherAddress: string;
}

export class FamilyCreateSwSignatureDto {
  userId: number;
  needId: number;
  childId: number;
}
