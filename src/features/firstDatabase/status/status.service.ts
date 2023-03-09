import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusEntity } from 'src/entities/status.entity';
import {
  NeedStatusUpdateModel,
  NeedStatusUpdatesAPIApi,
} from 'src/generated-sources/openapi';
import { HeaderOptions } from 'src/types/interface';
import { StatusParams } from 'src/types/parameters/StausParameters';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(StatusEntity)
    private statusRepository: Repository<StatusEntity>,
  ) { }

  findAll() {
    return `This action returns all status`;
  }

  getStatusById(flaskId: number): Promise<StatusEntity> {
    const user = this.statusRepository.findOne({
      where: {
        flaskId: flaskId,
      },
    });
    return user;
  }

  async getFlaskStatuses(
    options: HeaderOptions,
    needId: number,
    swId: number,
  ): Promise<NeedStatusUpdateModel[]> {
    const publicApi = new NeedStatusUpdatesAPIApi();
    const needRStatus: Promise<NeedStatusUpdateModel[]> =
      publicApi.apiV2NeedStatusUpdatesGet(
        options.accessToken,
        null,
        null,
        null,
        needId,
        swId,
      );
    return needRStatus;
  }


  async createStatus(statusDetails: StatusParams): Promise<StatusEntity> {
    const newStatus = this.statusRepository.create({
      ...statusDetails,
    });
    return this.statusRepository.save({ id: newStatus.id, ...newStatus });
  }

  updateStatus(
    statusId: string,
    statusDetails: StatusParams
  ): Promise<UpdateResult> {
    return this.statusRepository.update(statusId, {
      ...statusDetails,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} status`;
  }
}
