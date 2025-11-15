import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetCheckpointsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;

  // expected format: createdAt:desc or createdAt:asc
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt:desc';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isConfirmed?: boolean;
}
