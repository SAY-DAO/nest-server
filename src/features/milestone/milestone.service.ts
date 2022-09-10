import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { Repository } from 'typeorm';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { MileStoneRequest } from '../../types/requests/MileStoneRequest';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { StepService } from '../step/step.service';

@Injectable()
export class MilestoneService {
  constructor(
    @InjectRepository(MileStoneEntity)
    private mileRepository: Repository<MileStoneEntity>,
    private stepService: StepService,
    private childrenService: ChildrenService,
    private needService: NeedService,
  ) { }

  async getMilestones(): Promise<MileStoneEntity[]> {
    return await this.mileRepository.find({
      relations: {
        steps: false,
      },
    });
  }

  async createMileStone(request: MileStoneRequest): Promise<MileStoneEntity> {
    let theChild: ChildrenEntity;
    const steps = [];
    for (let i = 0; i < request.epics.length; i++) {
      const theNeed = await this.needService.GetNeedById(
        request.epics[i].needId,
      );
      if (!theChild) {
        theChild = await this.childrenService.GetChildById(theNeed.child.childId);
      }

      const step = await this.stepService.createStep(theNeed, request.epics[i]);
      steps.push(step);

    }
    const mileStone = await this.mileRepository.save({
      child: theChild,
      steps,
    });
    // need.participants = userList;
    // this.needRepository.save(need);

    // list.push(need);
    return mileStone;
  }
}
