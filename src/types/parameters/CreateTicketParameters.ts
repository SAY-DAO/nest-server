import { NeedEntity } from 'src/entities/need.entity';
import { AnnouncementEnum, Colors } from '../interfaces/interface';

export class CreateTicketParams {
  title: string;
  need: NeedEntity;
  role: number;
  flaskUserId: number;
  flaskNeedId: number;
  lastAnnouncement: AnnouncementEnum;
  color?: Colors | null;
}
