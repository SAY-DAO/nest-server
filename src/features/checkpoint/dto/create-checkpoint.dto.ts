import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsUrl,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckPointDto {
  @ApiProperty({
    example: { en: 'Finished editing homepage', fa: 'پایان ویرایش صفحه اصلی' },
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: { fa: string; en: string };

  @ApiProperty({ example: 'https://saydao.org/...', maxLength: 500 })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  url?: string;

  @ApiProperty({
    example: { en: 'The feature is finished', fa: 'این قابلیت به پایان رسید' },
    required: false,
  })
  @IsOptional()
  description: { fa: string; en: string };

  @IsDate()
  @IsNotEmpty()
  checkPointDate: Date;
}
