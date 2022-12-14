import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialWorkerEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { NeedService } from '../need/need.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';

@Module({
    imports: [TypeOrmModule.forFeature([ReceiptEntity, NeedEntity, SocialWorkerEntity])],
    controllers: [ReceiptController],
    providers: [ReceiptService, NeedService],
})
export class ReceiptModule {

}
