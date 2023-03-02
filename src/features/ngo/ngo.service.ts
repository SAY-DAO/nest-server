import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NgoEntity } from 'src/entities/ngo.entity';
import { NGOAPIApi, NgoModel } from 'src/generated-sources/openapi';
import { CityParams } from 'src/types/parameters/CityParameters';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(NgoEntity)
    private ngoRepository: Repository<NgoEntity>,
  ) {}

  getNgos(): Promise<NgoEntity[]> {
    return this.ngoRepository.find();
  }

  getFlaskNgos(accessToken: any): Promise<NgoModel> {
    const ngoApi = new NGOAPIApi();
    const ngos = ngoApi.apiV2NgoAllGet(accessToken);
    return ngos;
  }

  getFlaskNgo(accessToken: any, flaskNgoId: number): Promise<NgoModel> {
    const ngoApi = new NGOAPIApi();
    const ngo = ngoApi.apiV2NgoNgoIdngoIdGet(accessToken, flaskNgoId);
    return ngo;
  }

  getNgo(flaskNgoId: number): Promise<NgoEntity> {
    const ngo = this.ngoRepository.findOne({
      where: {
        flaskNgoId: flaskNgoId,
      },
    });
    return ngo;
  }

  createNgo(ngoDetails: NgoParams, city: CityParams): Promise<NgoEntity> {
    const newNgo = this.ngoRepository.create({
      ...ngoDetails,
      city: city,
    });
    return this.ngoRepository.save({id: newNgo.id,...newNgo});
  }

  async updateNgo(
    ngoId: string,
    ngoDetails: NgoParams,
    city: CityParams
  ): Promise<UpdateResult> {
    return this.ngoRepository.update(ngoId, {
      ...ngoDetails,
      city: city,
    });
  }
}
