import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../entities/need.entity';
import { NeedRequest } from '../requests/NeedRequest';
import { Repository } from 'typeorm';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) {}

  async getNeeds(): Promise<NeedEntity[]> {
    return await this.needRepository.find();
  }

  async createNeed(request: NeedRequest): Promise<NeedEntity> {
    const saved = await this.needRepository.save({
      need_id: request.need_id,
      title: request.title,
    });
    return saved;
  }
}
