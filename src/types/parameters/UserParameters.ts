import { NeedEntity } from '../../entities/need.entity';
import { PanelContributors } from '../interfaces/interface';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';

export type UserParams = {
  typeId?: number;
  birthDate?: Date;
  flaskUserId: number;
  isActive?: boolean;
  wallet?: EthereumAccountEntity;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  created?: Date;
  updated?: Date;
  panelRole?: PanelContributors;
  need?: NeedEntity;
  userName: string;
};

export class CreateParticipantDto {
  id_user: number;
  user_avatar: string;
}
