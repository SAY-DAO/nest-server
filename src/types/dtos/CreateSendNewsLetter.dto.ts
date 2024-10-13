import { IsNotEmpty } from 'class-validator';

export class CreateSendNewsLetterDto {
  @IsNotEmpty()
  isTest: boolean;
  @IsNotEmpty()
  fileName: string;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  smsLink: string;
  @IsNotEmpty()
  smsContent: string;
}
