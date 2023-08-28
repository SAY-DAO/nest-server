import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { ContributionEntity } from 'src/entities/contribution.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(ContributionEntity)
    private contributionRepository: Repository<ContributionEntity>,
  ) {}

  getAvailableContributions(): Promise<ContributionEntity[]> {
    return this.contributionRepository.find();
  }

  async getContribution(contributionId: string): Promise<ContributionEntity> {
    return await this.contributionRepository.findOne({
      where: {
        id: contributionId,
      },
    });
  }

  create(title: string, description: string): Promise<ContributionEntity> {
    const contribution = this.contributionRepository.create({
      title,
      description,
    });
    return this.contributionRepository.save(contribution);
  }

  async deleteOne(commentId: string): Promise<Observable<any>> {
    return from(this.contributionRepository.delete(commentId));
  }
}
