import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(NgoEntity)
    private ngoRepository: Repository<NgoEntity>,
    @InjectRepository(NGO, 'flaskPostgres')
    private ngoFlaskRepository: Repository<NGO>,
  ) { }

  getNgos(): Promise<NgoEntity[]> {
    return this.ngoRepository.find();
  }

  getFlaskNgos(): Promise<NGO[]> {
    return this.ngoFlaskRepository.find();

  }
  getFlaskNgo(flaskNgoId: number): Promise<NGO> {
    return this.ngoFlaskRepository.findOne({
      where: { id: flaskNgoId }
    });
  }


  getNgo(flaskNgoId: number): Promise<NgoEntity> {
    const ngo = this.ngoRepository.findOne({
      where: {
        flaskNgoId: flaskNgoId,
      },
    });
    return ngo;
  }

  createNgo(ngoDetails: NgoParams, city: CityEntity): Promise<NgoEntity> {
    const newNgo = this.ngoRepository.create({
      ...ngoDetails,
      city: city,
    });
    return this.ngoRepository.save({ id: newNgo.id, ...newNgo });
  }

  async updateNgo(
    ngoId: string,
    ngoDetails: NgoParams,
    city: CityEntity
  ): Promise<UpdateResult> {
    return this.ngoRepository.update(ngoId, {
      ...ngoDetails,
      city: city,
    });
  }
}
