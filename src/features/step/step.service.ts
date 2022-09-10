import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StepEntity } from '../../entities/step.entity';
import { Repository } from 'typeorm';
import { StepRequest } from '../../types/requests/MileStoneRequest';
import { ChildrenService } from '../children/children.service';
import { NeedEntity } from '../../entities/need.entity';

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(StepEntity)
    private stepepository: Repository<StepEntity>,
    private childrenService: ChildrenService,
  ) { }

  async createStep(need: NeedEntity, request: StepRequest): Promise<StepEntity> {
    const step = await this.stepepository.save({
      title: request.title,
      description: request.description,
      dueDate: request.dueDate,
      need: need,
    });

    return step;
  }
}
