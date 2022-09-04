import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MileStoneRequest } from '../../types/requests/MileStoneRequest';
import { NeedRequest } from '../../types/requests/NeedRequest';
import { MilestoneService } from './milestone.service';

@Controller('milestone')
@Controller('needs')
export class MilestoneController {
    // constructor(private needService: MilestoneService) { }

    // @Post(`milestone`)
    // async createMileStone(@Body() data: MileStoneRequest) {
    //     const mileStone = await this.needService.createMileStone(
    //         data
    //     );
    //     const result = { 'mileStone': mileStone }
    //     return result
    // }

}
