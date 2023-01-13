


import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedService } from '../need/need.service';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
    constructor(private childrenService: ChildrenService,
        private needService: NeedService,
    ) { }

    @Get(`flask/child/needs-summary/:childId`)
    @ApiOperation({ description: 'Get a single child needs summary by ID' })
    async getChildNeedsSummary(@Req() req: Request, @Param('childId') childId: number) {
        const accessToken = req.headers["authorization"]
        return await this.childrenService.getChildNeedsSummeay(accessToken, childId);
    }

}

