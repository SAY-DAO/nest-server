import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Crawler')
@Controller('crawler')
export class CrawlerController {
  constructor(private readonly service: CrawlerService) { }

  /**
   * Example: GET /digikala?url=https://www.example.com/dkp-12345/&force=true
   */
  @Get('digikala')
  async fetch(@Query('url') url: string) {
    if (!url) {
      throw new NotFoundException('Query parameter "url" is required.');
    }
    const res = await this.service.getData(url);
    console.log(url);
    console.log(res);

    if (!res) {
      throw new NotFoundException('Could not fetch product (DKP missing or APIs failed).');
    }
    return res;
  }
}
