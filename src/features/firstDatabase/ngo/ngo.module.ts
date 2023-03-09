import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NgoEntity } from '../../../entities/ngo.entity';
import { NgoController } from './ngo.controller';
import { NgoService } from './ngo.service';

@Module({
    imports: [TypeOrmModule.forFeature([NgoEntity])],
    controllers: [NgoController],
    providers: [NgoService],
})

export class NgoModule { }
