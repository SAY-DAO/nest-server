import { IsNotEmpty } from 'class-validator';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { SAYPlatformRoles } from '../interfaces/interface';

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
  message: NeedSignatureMessage
  signature: string

}

export class VerifySignatureDto {
  @IsNotEmpty()
  signature: string;
  @IsNotEmpty()
  message: string;
}

export class SwGenerateSignatureDto {
  @IsNotEmpty()
  childId: number;
  @IsNotEmpty()
  panelData: SwmypageNeeds;
  @IsNotEmpty()
  flaskUserId: number;
  @IsNotEmpty()
  signerAddress: string;
  @IsNotEmpty()
  userTypeId: number;
}

export class CreateSignatureDto {
  @IsNotEmpty()
  flaskNeedId: number;
  @IsNotEmpty()
  role: SAYPlatformRoles;
  @IsNotEmpty()
  flaskUserId: number;
  @IsNotEmpty()
  signerAddress: string;
}


export class FamilyCreateSwSignatureDto {
  userId: number;
  needId: number;
  childId: number;
  signerAddress: string;
}
