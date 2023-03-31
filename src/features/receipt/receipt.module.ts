import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { NeedService } from '../need/need.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Need,
      Child
    ], 'flaskPostgres'),
    TypeOrmModule.forFeature([ReceiptEntity, NeedEntity, ContributorEntity]),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, NeedService],
})
export class ReceiptModule { }
