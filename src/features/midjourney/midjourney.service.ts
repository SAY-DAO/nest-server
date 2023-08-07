import { Injectable } from '@nestjs/common';
import { MidjourneyEntity } from '../../entities/midjourney.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from 'src/entities/need.entity';

@Injectable()
export class MidjourneyService {
  constructor(
    @InjectRepository(MidjourneyEntity)
    private readonly midjourneyRepository: Repository<MidjourneyEntity>,
  ) {}

  async getAllImages(): Promise<MidjourneyEntity[]> {
    return this.midjourneyRepository.find();
  }

  async getImage(flaskNeedId: number): Promise<MidjourneyEntity> {
    return this.midjourneyRepository.findOne({
      where: {
        flaskNeedId: flaskNeedId,
      },
    });
  }
  async createImage(values: {
    flaskNeedId: number;
    need: NeedEntity;
    fileName: string;
  }): Promise<MidjourneyEntity> {
    return this.midjourneyRepository.save({
      flaskNeedId: values.flaskNeedId,
      fileName: values.fileName,
      need: values.need,
    });
  }
}
