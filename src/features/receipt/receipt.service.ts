import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { ReceiptParams } from '../../types/parameters/ReceiptParameter';
import { NeedService } from '../need/need.service';
import { NeedEntity } from '../../entities/need.entity';

@Injectable()
export class ReceiptService {
    constructor(
        @InjectRepository(ReceiptEntity)
        private receiptRepository: Repository<ReceiptEntity>,
        private needService: NeedService,
    ) { }

    getReceipts(): Promise<ReceiptEntity[]> {
        return this.receiptRepository.find();
    }


    getReceipt(flaskReceiptId: number): Promise<ReceiptEntity> {
        const user = this.receiptRepository.findOne({
            where: {
                flaskReceiptId: flaskReceiptId,
            },
        });
        return user;
    }

    async createReceipt(receiptDetails: ReceiptParams): Promise<ReceiptEntity> {
        const newReceipt = this.receiptRepository.create({
            ...receiptDetails,
        });
        return this.receiptRepository.save(newReceipt);
    }
}
