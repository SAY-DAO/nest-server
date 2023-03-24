import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { IpfsController } from './ipfs.controller';
import { HttpModule } from '@nestjs/axios';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { IpfsChildEntity, IpfsEntity, IpfsNeedEntity } from 'src/entities/ipfs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need], 'flaskPostgres'),
    TypeOrmModule.forFeature([NeedEntity, IpfsEntity, IpfsChildEntity, IpfsNeedEntity]),
    HttpModule,
  ],
  controllers: [IpfsController],
  providers: [IpfsService, NeedService],
})
export class IpfsModule { }
