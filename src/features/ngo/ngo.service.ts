import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NgoEntity } from 'src/entities/ngo.entity';
import { NGOAPIApi, NgoModel } from 'src/generated-sources/openapi';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { Repository } from 'typeorm';
import { FamilyEntity } from '../../entities/user.entity';

@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(NgoEntity)
    private ngoRepository: Repository<NgoEntity>,
  ) {}

  getNgos(accessToken: any): Promise<NgoModel> {
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

  createNgo(ngoDetails: NgoParams): Promise<NgoEntity> {
    const newNgo = this.ngoRepository.create({
      ...ngoDetails,
    });
    return this.ngoRepository.save(newNgo);
  }
}
