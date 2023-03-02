import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';
import { CityParams } from 'src/types/parameters/CityParameters';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) { }


  getCities(): Promise<CityEntity[]> {
    return this.cityRepository.find();
  }
  
  createCity(cityDetails: CityParams): Promise<CityEntity> {
    const newNgo = this.cityRepository.create({
      flaskId: cityDetails,
      ...cityDetails,
    });
    return this.cityRepository.save(newNgo);
  }

  
  getCityById(flaskCityId: number): Promise<CityEntity> {
    const user = this.cityRepository.findOne({
      where: {
        flaskId: flaskCityId,
      },
    });
    return user;
  }
}
