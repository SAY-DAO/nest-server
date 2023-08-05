import { Injectable } from '@nestjs/common';
import { CreateMidjourneyDto } from './dto/create-midjourney.dto';
import { UpdateMidjourneyDto } from './dto/update-midjourney.dto';

@Injectable()
export class MidjourneyService {
  create(createMidjourneyDto: CreateMidjourneyDto) {
    return 'This action adds a new midjourney';
  }

  findAll() {
    return `This action returns all midjourney`;
  }

  findOne(id: number) {
    return `This action returns a #${id} midjourney`;
  }

  update(id: number, updateMidjourneyDto: UpdateMidjourneyDto) {
    return `This action updates a #${id} midjourney`;
  }

  remove(id: number) {
    return `This action removes a #${id} midjourney`;
  }
}
