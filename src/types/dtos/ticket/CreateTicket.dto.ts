import { IsNotEmpty } from 'class-validator';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { CreateSocialWorkerDto } from '../CreateSocialWorker.dto';

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
  userId: number;
  @IsNotEmpty()
  needId: number;
  @IsNotEmpty()
  userType: number;
  @IsNotEmpty()
  roles: string[];
  @IsNotEmpty()
  need: SwmypageNeeds;
  @IsNotEmpty()
  childId: number;
}
