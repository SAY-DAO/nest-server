import { IsNotEmpty } from 'class-validator';
import { VirtualFamilyRole } from '../interfaces/interface';

export class CreateCommentDto {
  @IsNotEmpty()
  flaskNeedId: number;
  @IsNotEmpty()
  vRole: VirtualFamilyRole;
  @IsNotEmpty()
  message: string;
}
