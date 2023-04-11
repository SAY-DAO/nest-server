import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { NgoEntity } from '../../entities/ngo.entity';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NGO, Need], 'flaskPostgres'),
    TypeOrmModule.forFeature([NgoEntity]),
  ],
  controllers: [NgoController],
  providers: [NgoService],
})
export class NgoModule { }
