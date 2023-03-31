import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { Repository } from 'typeorm';
import { ProviderParams } from '../../types/parameters/ProviderParams';
import { from, Observable } from 'rxjs';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';


@Injectable()
export class ProviderService {
    constructor(
        @InjectRepository(ProviderEntity)
        private providerRepository: Repository<ProviderEntity>,
        @InjectRepository(ProviderJoinNeedEntity)
        private providerJoinNeedRepository: Repository<ProviderJoinNeedEntity>,

    ) { }

    async getProviders(
    ): Promise<ProviderEntity[]> {
        return this.providerRepository.find()
    }

    getProviderById(id: string): Promise<ProviderEntity> {
        const provider = this.providerRepository.findOne({
            where: {
                id,
            }
        });
        return provider;
    }

    getProviderByName(name: string): Promise<ProviderEntity> {
        const provider = this.providerRepository.findOne({
            where: {
                name,
            }
        });
        return provider;
    }

    // --------------------------------- Adds providers for older needs before panel version 2.0.0 ----------------------------------------------- //

    async getProviderNeedRelationById(flaskNeedId: number): Promise<ProviderJoinNeedEntity> {
        return await this.providerJoinNeedRepository.findOne({
            where: {
                flaskNeedId,
            }
        });

    }

    createRelation(
        flaskNeedId: number,
        nestProviderId: string,
    ): Promise<ProviderJoinNeedEntity> {
        const newProvider = this.providerJoinNeedRepository.create({
            flaskNeedId, nestProviderId
        });
        return this.providerJoinNeedRepository.save(newProvider);
    }
    // -------------------------------------------------------------------------------- //
    createProvider(
        providerDetails: ProviderParams,
    ): Promise<ProviderEntity> {
        const newProvider = this.providerRepository.create({
            name: providerDetails.name,
            description: providerDetails.description,
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

    updateProvider(
        id: string,
        updateProviderDetails: ProviderParams,
    ) {
        return this.providerRepository.update(
            id,
            { ...updateProviderDetails },
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.providerRepository.delete(id));
    }

}
