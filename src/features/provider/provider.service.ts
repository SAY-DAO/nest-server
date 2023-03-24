import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { Repository } from 'typeorm';
import { ProviderParams } from '../../types/parameters/ProviderParams';
import { from, Observable } from 'rxjs';


@Injectable()
export class ProviderService {
    constructor(
        @InjectRepository(ProviderEntity)
        private providerRepository: Repository<ProviderEntity>,
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
