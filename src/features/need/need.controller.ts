import {  Controller, Get, Param } from '@nestjs/common';
import { ApiOperation,  ApiTags } from '@nestjs/swagger';
import { NeedService } from './need.service';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService) { }

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
}
