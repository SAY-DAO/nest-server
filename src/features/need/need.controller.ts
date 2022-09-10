import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedService } from './need.service';

export const NEEDS_URL = 'http://localhost:3000/api/dao/sync/update';


@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeeds(@Query('page') page = 1, @Query('limit') limit = 10) {
    limit = limit > 100 ? 100 : limit;

    return this.needService.getNeeds({
      limit: Number(limit),
      page: Number(page),
      route: NEEDS_URL
    })

  }

  @Get(`:needId`)
  @ApiOperation({ description: 'Get one need' })
  async getOneNeed(@Param('needId') needId: number) {
    return await this.needService.GetNeedById(needId);
  }

  @Get(`child/done/:id`)
  @ApiOperation({ description: 'Get child all done need' })
  async getChildNeeds(@Param('id') id: number) {
    return await this.needService.getChildNeeds(id);
  }
}
