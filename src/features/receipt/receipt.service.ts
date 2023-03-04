import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { id } from 'ethers';
import { NeedAPIApi, NeedReceipt } from 'src/generated-sources/openapi';
import { HeaderOptions } from 'src/types/interface';
import { Repository, UpdateResult } from 'typeorm';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { ReceiptParams } from '../../types/parameters/ReceiptParameter';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(ReceiptEntity)
    private receiptRepository: Repository<ReceiptEntity>,
  ) {}

  getReceipts(): Promise<ReceiptEntity[]> {
    return this.receiptRepository.find();
  }

  getReceiptById(flaskReceiptId: number): Promise<ReceiptEntity> {
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
    return this.receiptRepository.save({id: newReceipt.id,...newReceipt});
  }

  async updateReceipt(
    receiptDetails: ReceiptParams,
    receipt: ReceiptEntity,
  ): Promise<UpdateResult> {
    return this.receiptRepository.update(
      { id: receipt.id },
      { ...receiptDetails },
    );
  }

  async getFlaskReceipts(
    options: HeaderOptions,
    needId: number,
  ): Promise<NeedReceipt[]> {
    const publicApi = new NeedAPIApi();
    const needReceipts: Promise<NeedReceipt[]> =
      publicApi.apiV2NeedsIdReceiptsGet(needId, options.accessToken);
    return needReceipts;
  }
}
