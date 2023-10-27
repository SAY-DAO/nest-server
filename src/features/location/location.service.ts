import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { LocationEntity } from 'src/entities/location.entity';
import { CityParams } from 'src/types/parameters/CityParameters';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationEntity)
    private locationRepository: Repository<LocationEntity>,
    @InjectRepository(Cities, 'flaskPostgres')
    private cityFlaskRepository: Repository<Cities>,
  ) {}

  getCities(): Promise<LocationEntity[]> {
    return this.locationRepository.find();
  }

  getCityById(flaskCityId: number): Promise<LocationEntity> {
    const city = this.locationRepository.findOne({
      where: {
        flaskCityId,
      },
    });
    return city;
  }

  getFlaskCities(): Promise<Cities[]> {
    return this.cityFlaskRepository.find();
  }
  async getFlaskCity(id: number): Promise<Cities> {
    return this.cityFlaskRepository.findOne({
      where: { id: id },
    });
  }

  getCityByFlaskId(flaskCityId: number): Promise<LocationEntity> {
    const city = this.locationRepository.findOne({
      where: {
        flaskCityId: flaskCityId,
      },
    });
    return city;
  }

  createLocation(cityDetails: CityParams): Promise<LocationEntity> {
    const location = this.locationRepository.create({
      flaskCityId: cityDetails.flaskCityId,
      ...cityDetails,
    });
    return this.locationRepository.save(location);
  }
}
