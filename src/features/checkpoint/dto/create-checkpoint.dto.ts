import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CheckPointType } from 'src/types/interfaces/checkpoint-type.enum';

export class CreateCheckPointDto {
  @ApiProperty({ example: 'Finished editing homepage', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'The feature is finished',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    enum: CheckPointType,
    example: CheckPointType.DESIGN,
    required: false,
  })
  @IsOptional()
  @IsEnum(CheckPointType)
  type: CheckPointType;
}
