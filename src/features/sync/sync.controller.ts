import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { SyncRequest } from '../../types/requests/SyncRequest';

@ApiTags('Sync')
@Controller('sync')
export class SyncController { // panel usage
    constructor(private needService: NeedService,
        private childrenService: ChildrenService) { }

    @Post(`update`)
    async updateServer(@Body() data: SyncRequest) {
        let childResult
        if (data.childData) {
            childResult = await this.childrenService.createChild({
                childData: data.childData,
                totalChildCount: data.totalChildCount,
            });
        }

        const needResult = await this.needService.createNeeds({
            totalCount: data.totalCount,
            needData: data.needData,
        });

        const result = { 'nestChildResult': childResult, 'nestNeedResult': needResult }
        return result
    }
}
