


import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenEntity } from 'src/entities/children.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
    constructor(private childrenService: ChildrenService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all children from db' })
    async getChildren() {
        return await this.childrenService.getChildren()
    }

    @Get(`flask/child/needs-summary/:childId`)
    @ApiOperation({ description: 'Get a single child needs summary by ID' })
    async getChildNeedsSummary(@Req() req: Request, @Param('childId') childId: number) {
        const accessToken = req.headers["authorization"]
        return await this.childrenService.getChildNeedsSummery(accessToken, childId);
    }
}

