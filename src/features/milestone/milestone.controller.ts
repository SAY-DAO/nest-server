import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMileStoneDto } from '../../types/dtos/CreateMileStone.dto';
import { MilestoneService } from './milestone.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { StepService } from '../step/step.service';
import { ChildrenEntity } from 'src/entities/children.entity';

@ApiTags('Milestone')
@Controller('Milestone')
export class MilestoneController {
  constructor(private mileStoneService: MilestoneService,
    private stepService: StepService,
    private childrenService: ChildrenService,
    private needService: NeedService
  ) { }


  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getMilestones() {
    return await this.mileStoneService.getMilestones();
  }

  @Post(`create`)
  async createMileStone(@Body() data: CreateMileStoneDto) {
    let theChild: ChildrenEntity;
    const steps = [];
    for (let i = 0; i < data.epics.length; i++) {
      const theNeed = await this.needService.getNeedById(
        data.epics[i].needId,
      );
      if (!theChild) {
        theChild = await this.childrenService.getChildById(theNeed.child.childId);
      }

      const step = this.stepService.createStep(theNeed, data.epics[i]);
      steps.push(step);
    }
    const mileStone = await this.mileStoneService.createMileStone(steps, theChild);
    const result = { mileStone: mileStone };
    return result;
  }
}
