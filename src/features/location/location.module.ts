import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Cities } from 'src/entities/flaskEntities/cities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'src/entities/location.entity';
import { LocationMiddleware } from './middlewares/location.middleware';
import { Countries } from 'src/entities/flaskEntities/countries.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cities, Countries], 'flaskPostgres'),
    TypeOrmModule.forFeature([LocationEntity]),
  ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LocationMiddleware).forRoutes('location');
  }
}
