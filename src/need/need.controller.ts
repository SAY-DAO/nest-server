import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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

    @Get(`user/done`)
    @ApiOperation({ description: 'Get users all done need' })
    async getUserDoneNeeds(@Param('id') id: number) {
        return await this.needService.getUserDoneNeeds(id);
    }

}
