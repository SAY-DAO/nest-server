import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { Repository } from 'typeorm';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { StepEntity } from '../../entities/step.entity';


@Injectable()
export class MilestoneService {
  constructor(
    @InjectRepository(MileStoneEntity)
    private mileRepository: Repository<MileStoneEntity>,

  ) { }

  async getMilestones(): Promise<MileStoneEntity[]> {
    return await this.mileRepository.find({
      relations: {
        steps: false,
      },
    });
  }

  createMileStone(steps: StepEntity[], theChild: ChildrenEntity): Promise<MileStoneEntity> {
    const mileStone = this.mileRepository.create({
      child: theChild,
      steps,
    });
    return this.mileRepository.save(mileStone)
  }
}
