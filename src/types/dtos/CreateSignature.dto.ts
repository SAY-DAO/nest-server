import { IsNotEmpty } from 'class-validator';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { CreateSocialWorkerDto } from './CreateSocialWorker.dto';


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

export class SwCreateSwSignatureDto {
  @IsNotEmpty()
  panelData: customNeed;
  @IsNotEmpty()
  childId: number;
  @IsNotEmpty()
  roles: string[];
  @IsNotEmpty()
  callerId: number;
  @IsNotEmpty()
  ngoId: number;
  @IsNotEmpty()
  socialWorker: CreateSocialWorkerDto;
  @IsNotEmpty()
  signerAddress: string;
}

export class FamilyCreateSwSignatureDto {
  userId: number;
  needId: number;
  childId: number;
  signerAddress: string;
}
