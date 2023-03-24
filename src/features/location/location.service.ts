import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { CityEntity } from 'src/entities/city.entity';
import { CityParams } from 'src/types/parameters/CityParameters';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {
    constructor(
        @InjectRepository(CityEntity)
        private cityRepository: Repository<CityEntity>,
        @InjectRepository(Cities, 'flaskPostgres')
        private cityFlaskRepository: Repository<Cities>,
    ) { }


    getCities(): Promise<CityEntity[]> {
        return this.cityRepository.find();
    }



    getCityById(flaskCityId: number): Promise<CityEntity> {
        const user = this.cityRepository.findOne({
            where: {
                flaskCityId,
            },
        });
        return user;
    }

    getFlaskCities(): Promise<Cities[]> {
        return this.cityFlaskRepository.find();

    }
    async getFlaskCity(id: number): Promise<Cities> {
        return this.cityFlaskRepository.findOne({
            where: { id: id }
        });
    }


    getCityByFlaskId(flaskCityId: number): Promise<CityEntity> {
        const city = this.cityRepository.findOne({
            where: {
                flaskCityId: flaskCityId,
            },
        });
        return city;
    }

    createCity(cityDetails: CityParams): Promise<CityEntity> {
        const newNgo = this.cityRepository.create({
            flaskCityId: cityDetails,
            ...cityDetails,
        });
        return this.cityRepository.save(newNgo);
    }


}
