import { SeasonComparisonItemDto } from './season-comparison-item.dto';

export class SeasonComparisonResponseDto {
  doneNeeds: { data: SeasonComparisonItemDto[]; season?: string };
  totalUsers: { data: SeasonComparisonItemDto[]; season?: string };
  pays: { data: SeasonComparisonItemDto[]; season?: string };
}
