import { NeedEntity } from '../../entities/need.entity';
import { PanelContributors } from '../interfaces/interface';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';

export type UserParams = {
  typeId?: number;
  birthDate?: Date;
  flaskUserId: number;
  wallet?: EthereumAccountEntity;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  panelRole?: PanelContributors;
  need?: NeedEntity;
  userName: string;
};

export class CreateParticipantDto {
  id_user: number;
  user_avatar: string;
}
