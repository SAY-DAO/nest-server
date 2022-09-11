import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { SyncRequest } from '../../types/requests/SyncRequest';
import { AllExceptionsFilter } from '../../filters/all-exception.filter';
import { ChildrenEntity } from '../../entities/children.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';

@ApiTags('Sync')
@Controller('sync')
export class SyncController { // panel usage
    constructor(private needService: NeedService,
        private childrenService: ChildrenService,
    ) { }

    @Post(`update`)
    @UseFilters(AllExceptionsFilter)
    async updateServer(@Body() data: SyncRequest) {
        let childResult: ChildrenEntity[]
        let needResult: NeedEntity[]

        // from social worker panel
        if (data.childData) {
            childResult = await this.childrenService.syncChildren({
                childData: data.childData,
                totalChildCount: data.totalChildCount,
            });
        }

        if (data.needData) {
            needResult = await this.needService.syncNeeds({
                totalCount: data.totalCount,
                needData: data.needData,
                childId: data.childId,
            });
        }



        const result = { 'nestChildResult': childResult, 'nestNeedResult': needResult }
        return result
    }
}

