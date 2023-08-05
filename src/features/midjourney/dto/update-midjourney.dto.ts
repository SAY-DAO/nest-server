import { PartialType } from '@nestjs/swagger';
import { CreateMidjourneyDto } from './create-midjourney.dto';

export class UpdateMidjourneyDto extends PartialType(CreateMidjourneyDto) {}
