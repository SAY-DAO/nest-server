import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StepEntity } from '../../entities/step.entity';
import { Repository } from 'typeorm';
import { CreateStepDto } from '../../types/dtos/CreateMileStone.dto';
import { NeedEntity } from '../../entities/need.entity';

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(StepEntity)
    private stepRepository: Repository<StepEntity>,
  ) { }

  async createStep(need: NeedEntity, request: CreateStepDto): Promise<StepEntity> {
    const step = await this.stepRepository.save({
      title: request.title,
      description: request.description,
      dueDate: request.dueDate,
      need: need,
    });

    return step;
  }
}
