import { PartialType } from '@nestjs/swagger';
import { CreateCrawlerDto } from './create-crawler.dto';

export class UpdateCrawlerDto extends PartialType(CreateCrawlerDto) {}
