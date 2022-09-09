import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NeedRequest } from '../../types/requests/NeedRequest';
import { NeedService } from './need.service';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeeds() {
    return await this.needService.getNeeds();
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

  @Post(`child/update`)
  async updateChildNeeds(@Body() data: NeedRequest) {
    const needResult = await this.needService.createNeeds({
      totalCount: data.totalCount,
      needData: data.needData,
      child_id: data.child_id,
    });

    const result = { nestNeedResult: needResult };
    return result;
  }
}
