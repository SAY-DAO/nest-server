import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../entities/need.entity';
import { Repository } from 'typeorm';
import { NeedRequest } from '../types/requests/NeedRequest';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) { }

  async getNeeds(): Promise<NeedEntity[]> {
    return await this.needRepository.find();
  }

  async getUserDoneNeeds(id: number): Promise<number> {
    const thisNeed = await this.needRepository.find({
      where: {
        isDone: true,
      },
    })
    return thisNeed.length
  }

  async createNeed(request: NeedRequest): Promise<number> {
    console.log(request)
    for (let i = 0; i < request.needData.length; i++) {
      const thisNeed = await this.needRepository.findOne({
        where: {
          need_id: request.needData[i].need_id,
        },
      })
      if (thisNeed) {
        continue
      }
      const saved = await this.needRepository.save({
        need_id: request.needData[i].need_id,
        title: request.needData[i].title,
        affiliateLinkUrl: request.needData[i].affiliateLinkUrl,
        bank_track_id: request.needData[i].bank_track_id,
        category: request.needData[i].category,
        childGeneratedCode: request.needData[i].childGeneratedCode,
        childSayName: request.needData[i].childSayName,
        child_delivery_date: new Date(request.needData[i].child_delivery_date),
        child_id: request.needData[i].child_id,
        confirmDate: new Date(request.needData[i].confirmDate),
        confirmUser: request.needData[i].confirmUser,
        cost: request.needData[i].cost,
        created: new Date(request.needData[i].created),
        created_by_id: request.needData[i].created_by_id,
        deleted_at: new Date(request.needData[i].deleted_at),
        description: request.needData[i].description, // { en: '' , fa: ''}
        description_translations: request.needData[i].description_translations,  // { en: '' , fa: ''}
        title_translations: request.needData[i].title_translations,
        details: request.needData[i].details,
        doing_duration: request.needData[i].doing_duration,
        donated: request.needData[i].donated,
        doneAt: new Date(request.needData[i].doneAt),
        expected_delivery_date: new Date(request.needData[i].expected_delivery_date),
        informations: request.needData[i].informations,
        isConfirmed: request.needData[i].isConfirmed,
        isDeleted: request.needData[i].isDeleted,
        isDone: request.needData[i].isDone,
        isReported: request.needData[i].isReported,
        isUrgent: request.needData[i].isUrgent,
        ngoId: request.needData[i].ngoId,
        ngoAddress: request.needData[i].ngoAddress,
        ngoName: request.needData[i].ngoName,
        ngo_delivery_date: new Date(request.needData[i].ngo_delivery_date),
        oncePurchased: request.needData[i].oncePurchased,
        paid: request.needData[i].paid,
        purchase_cost: request.needData[i].purchase_cost,
        purchase_date: new Date(request.needData[i].purchase_date),
        receipt_count: request.needData[i].receipt_count,
        receipts: request.needData[i].receipts,
        status: request.needData[i].status,
        status_description: request.needData[i].status_description,
        status_updated_at: new Date(request.needData[i].status_updated_at),
        type: request.needData[i].type,
        type_name: request.needData[i].type_name,
        unavailable_from: new Date(request.needData[i].unavailable_from),
        unconfirmed_at: new Date(request.needData[i].unconfirmed_at),
        unpaid_cost: request.needData[i].unpaid_cost,
        unpayable: request.needData[i].unpayable,
        unpayable_from: new Date(request.needData[i].unpayable_from),
        updated: new Date(request.needData[i].updated),
        payments: request.needData[i].payments, // []
        imageUrl: request.needData[i].imageUrl,
        need_retailer_img: request.needData[i].need_retailer_img,
      });
    }

    return request.totalCount;
  }
}


