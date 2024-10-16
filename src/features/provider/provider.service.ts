import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { Repository } from 'typeorm';
import { ProviderParams } from '../../types/parameters/ProviderParams';
import { from, Observable } from 'rxjs';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { capitalizeFirstLetter } from 'src/utils/helpers';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(ProviderEntity)
    private providerRepository: Repository<ProviderEntity>,
    @InjectRepository(ProviderJoinNeedEntity)
    private providerJoinNeedRepository: Repository<ProviderJoinNeedEntity>,
  ) {}

  async getProviders(): Promise<ProviderEntity[]> {
    return this.providerRepository.find({
      order: {
        type: 'DESC',
      },
    });
  }

  getProviderById(id: string): Promise<ProviderEntity> {
    const provider = this.providerRepository.findOne({
      where: {
        id,
      },
    });
    return provider;
  }

  getProviderByName(name: string): Promise<ProviderEntity> {
    let provider = this.providerRepository.findOne({
      where: {
        name,
      },
    });
    if (!provider) {
      provider = this.providerRepository.findOne({
        where: {
          name: name.toLowerCase(),
        },
      });
    }
    if (!provider) {
      provider = this.providerRepository.findOne({
        where: {
          name: capitalizeFirstLetter(name),
        },
      });
    }
    return provider;
  }

  // --------------------------------- to add providers for older needs before panel version 2.0.0 ----------------------------------------------- //

  async getProviderNeedRelationById(
    flaskNeedId: number,
  ): Promise<ProviderJoinNeedEntity> {
    return await this.providerJoinNeedRepository.findOne({
      where: {
        flaskNeedId,
      },
    });
  }

  createRelation(
    flaskNeedId: number,
    nestProviderId: string,
  ): Promise<ProviderJoinNeedEntity> {
    const rel = this.providerJoinNeedRepository.create({
      flaskNeedId,
      nestProviderId,
    });
    return this.providerJoinNeedRepository.save(rel);
  }

  updateProviderRelation(
    id: string,
    flaskNeedId: number,
    nestProviderId: string,
  ) {
    return this.providerJoinNeedRepository.update(id, {
      flaskNeedId,
      nestProviderId,
    });
  }
  // -------------------------------------------------------------------------------- //
  createProvider(providerDetails: ProviderParams): Promise<ProviderEntity> {
    const newProvider = this.providerRepository.create({
      name: providerDetails.name,
      description: providerDetails.description,
      address: providerDetails.address,
      type: providerDetails.type,
      typeName: providerDetails.typeName,
      website: providerDetails.website,
      city: providerDetails.city,
      state: providerDetails.state,
      country: providerDetails.country,
      logoUrl: providerDetails.logoUrl,
      isActive: providerDetails.isActive,
    });
    return this.providerRepository.save(newProvider);
  }

  updateProvider(id: string, updateProviderDetails: ProviderParams) {
    return this.providerRepository.update(id, { ...updateProviderDetails });
  }

  deleteOne(id: number): Observable<any> {
    return from(this.providerRepository.delete(id));
  }
}
