export class SeasonComparisonItemDto {
  monthIndex: number;
  period: string;
  current: string;
  previous: string;
}

export class SeasonComparisonResponseDto {
  doneNeeds: { data: SeasonComparisonItemDto[]; season?: string };
  totalUsers: { data: SeasonComparisonItemDto[]; season?: string };
  pays: { data: SeasonComparisonItemDto[]; season?: string };
  children: { data: SeasonComparisonItemDto[]; season?: string };
}
