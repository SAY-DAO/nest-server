import { IsNotEmpty } from 'class-validator';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { CreatePaymentDto } from '../CreatePayment.dto';
import { CreateReceiptDto } from '../CreateReceipt.dto';
import { CreateSocialWorkerDto } from '../CreateSocialWorker.dto';
import { CreateStatusDto } from '../CreateStatus.dto';

export class customNeed {
  need: SwmypageNeeds;
  child: {
    id: number;
    sayName: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    awakeAvatarUrl: string;
  };
}

export class CreateTicketDto {
  title: string;
  @IsNotEmpty()
  flaskNeedId: number;
  @IsNotEmpty()
  flaskUserId: number;
  @IsNotEmpty()
  userTypeId: number;
  statuses?: CreateStatusDto[]
  receipts?: CreateReceiptDto[]
  payments?: CreatePaymentDto[]
  @IsNotEmpty()
  roles: string[];
  isDone: boolean
  paid: number
  unpayable: boolean
  unpayableFrom: Date
}
