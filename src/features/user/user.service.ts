import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from '../../types/interface';
import { Repository } from 'typeorm';
import { SocialWorkerEntity, FamilyEntity } from '../../entities/user.entity';
import { FamilyParams, SocialWorkerParams } from '../../types/parameters/UserParameters';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(FamilyEntity)
    private FamilyRepository: Repository<FamilyEntity>,
    @InjectRepository(SocialWorkerEntity)
    private socialWorkerRepository: Repository<SocialWorkerEntity>
  ) { }

  async getFamilies(): Promise<FamilyEntity[]> {
    return await this.FamilyRepository.find({
      relations: {
        payments: true,
      },
    });
  }

  async getSocialWorkers(): Promise<SocialWorkerEntity[]> {
    return await this.socialWorkerRepository.find();
  }

  async getFamily(flaskId: number): Promise<FamilyEntity> {
    const user = await this.FamilyRepository.findOne({
      where: {
        flaskUserId: flaskId,
      },
    });
    return user;
  }

  async getSocialWorker(flaskSwId: number): Promise<SocialWorkerEntity> {
    const socialWorker = await this.socialWorkerRepository.findOne({
      where: {
        flaskSwId: flaskSwId,
      },
    });
    return socialWorker;
  }

  async getUserDoneNeeds(flaskUserId: number): Promise<FamilyEntity> {
    return await this.FamilyRepository.findOne({
      where: {
        flaskUserId,
      },
      relations: {
        doneNeeds: true,
      },
    });
  }

  createFamilyMember(userDetails: FamilyParams): Promise<FamilyEntity> {
    const newUser = this.FamilyRepository.create({
      flaskUserId: userDetails.flaskUserId,
      avatarUrl: userDetails.avatarUrl,
      role: RolesEnum.FAMILY,
      isActive: userDetails.isActive,
    });
    return this.FamilyRepository.save(newUser);
  }

  createSocialWorker(swDetails: SocialWorkerParams): Promise<SocialWorkerEntity> {
    const newSw = this.socialWorkerRepository.create({
      flaskSwId: swDetails.flaskSwId,
      ngo: swDetails.ngo,
      avatarUrl: swDetails.avatarUrl,
      role: RolesEnum.SOCIAL_WORKER,
      isActive: swDetails.isActive,
    });
    return this.socialWorkerRepository.save(newSw);
  }

}