import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MileStoneRequest } from '../../types/requests/MileStoneRequest';
import { MilestoneService } from './milestone.service';

@ApiTags('Milestone')
@Controller('Milestone')
export class MilestoneController {
    constructor(private mileStoneService: MilestoneService) { }

    @Post(`create`)
    async createMileStone(@Body() data: MileStoneRequest) {
        const mileStone = await this.mileStoneService.createMileStone(
            data
        );
        const result = { 'mileStone': mileStone }
        return result
    }

}
