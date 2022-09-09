import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MileStoneRequest } from '../../types/requests/MileStoneRequest';
import { MilestoneService } from './milestone.service';

@ApiTags('Milestone')
@Controller('Milestone')
export class MilestoneController {
  constructor(private mileStoneService: MilestoneService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getMilestones() {
    return await this.mileStoneService.getMilestones();
  }

  @Post(`create`)
  async createMileStone(@Body() data: MileStoneRequest) {
    const mileStone = await this.mileStoneService.createMileStone(data);
    const result = { mileStone: mileStone };
    return result;
  }
}
