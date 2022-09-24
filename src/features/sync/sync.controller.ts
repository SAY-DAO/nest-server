import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { SyncRequestDto } from '../../types/dtos/SyncRequest.dto';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { ValidateSyncRequestPipe } from './pipes/validate-sync-request.pipe';
import { AuthGuard } from './guards/auth.guard';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController { // panel usage
    constructor(private needService: NeedService,
        private childrenService: ChildrenService,
    ) { }

    @Post(`update`)
    @UsePipes(new ValidationPipe())
    async updateServer(@Body(ValidateSyncRequestPipe) data: SyncRequestDto) {
        let childrenResult: ChildrenEntity[]
        let childResult: ChildrenEntity;
        let needResult: NeedEntity[]
        // from social worker panel
        if (data.childData) {
            childrenResult = await this.childrenService.syncChildren({
                childData: data.childData,
            });
        }
        // from dapp
        if (data.childId) {
            childResult = await this.childrenService.createChild({
                childId: data.childId,
            });
        }
        if (data.needData) {
            needResult = await this.needService.syncNeeds({
                needData: data.needData,
                childId: data.childId,
            });
        }

        const result = { 'nestChildrenResult': childrenResult, 'nestNeedResult': needResult, "nestChildResult": childResult }
        return result
    }
}

