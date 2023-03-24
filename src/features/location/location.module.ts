import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cities], 'flaskPostgres'),
    TypeOrmModule.forFeature([CityEntity]),
  ],
  controllers: [LocationController],
  providers: [LocationService]
})
export class LocationModule { }
