import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedService } from './need.service';

export const NEEDS_URL = 'http://localhost:3000/api/dao/sync/update';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
  ) { }


  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds() {
    return await this.needService.getNeeds()
  }



  @Get(`flask/random`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getRandomNeed() {
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/preneed`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const accessToken = req.headers['authorization'];
    const preNeeds = await this.needService.getFlaskPreNeed(accessToken);
    return preNeeds;
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(
    @Param('id') id: number
  ) {
    return await this.needService.getFlaskNeed(id)
  }



}
