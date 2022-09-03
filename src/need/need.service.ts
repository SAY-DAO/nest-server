import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from '../entities/need.entity';
import { Repository } from 'typeorm';
import { Need, NeedRequest } from '../types/requests/NeedRequest';
import { UserService } from '../user/user.service';

@Injectable()
export class NeedService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    private userService: UserService
  ) { }

  async getNeeds(): Promise<NeedEntity[]> {
    return await this.needRepository.find();
  }

  async getChildNeeds(id: number): Promise<NeedEntity[]> {
    const needs = await this.needRepository.find({
      where: {
        child_id: id,
      },
    })
    return needs
  }


  async updateNeed(
    need: Need,
    request: Need,
  ): Promise<Need> {

    if (need.participants) {
      console.log('fgfgf-g-g-----------------------------------partic exist--------------------')
      need.title = request.title;
      need.category = request.category;
      need.created = request.created;
      need.doneAt = request.doneAt;
      need.imageUrl = request.imageUrl;
      need.isDone = request.isDone;
      need.isUrgent = request.isUrgent;
      need.progress = request.progress;
      need.type = request.type;
      need.unpayable = request.unpayable;
      this.needRepository.save(need)

      for (let k = 0; k < request.participants?.length; k++) {
        let user = await this.userService.getUser(request.participants[k].id_user)
        if (!user) {
          user = await this.userService.createUser({ id_user: request.participants[k].id_user })
        }
        // check if participants already saved
        const array1 = need.participants
        const array2 = request.participants
        let isSame = (array1.length == array2.length) && array1.every(function (element, index) {
          return element === array2[index];
        });
        // add users which are not saved
        if (!isSame && array1[0]) {
          let array = need.participants;
          let id_user = request.participants[k].id_user; //Element to be searched
          for (let i = 0; i < array.length; i++) {
            if (id_user === array[i].id_user) {
              console.log('Element Found');
              need.participants = [...need.participants, user]
              this.needRepository.save(need)
            }
          }

        }
      }
    } else {
      console.log('------------------emty patic update-----------')
      console.log(request.participants)
      console.log(need.participants)
      need.participants = request.participants
      console.log(need.participants)
      this.needRepository.save(need)
    }



    return need
  }


  async createNeeds(request: NeedRequest): Promise<NeedEntity[]> {
    let list = []
    for (let i = 0; i < request.needData.length; i++) {
      let thisNeed = await this.needRepository.findOne({
        where: {
          need_id: request.needData[i].need_id,
        },
        relations: {
          participants: true,
        },
      })
      // if already created only update
      if (thisNeed) {
        console.log('------------------second time updatin now-----------')
        // console.log(thisNeed)
        const updatedNeed = await this.updateNeed(thisNeed, request.needData[i])
        list.push(updatedNeed)
        continue
      }

      let userList = []
      for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
        let user = await this.userService.getUser(request.needData[i].participants[k].id_user)
        if (!user) {
          user = await this.userService.createUser({ id_user: request.needData[i].participants[k].id_user })
        }
        userList.push(user)
      }

      let need = await this.needRepository.save({
        need_id: request.needData[i].need_id,
        title: request.needData[i].title,
        affiliateLinkUrl: request.needData[i].affiliateLinkUrl,
        bank_track_id: request.needData[i].bank_track_id,
        category: request.needData[i].category,
        childGeneratedCode: request.needData[i]?.childGeneratedCode,
        childSayName: request.needData[i].childSayName,
        child_delivery_date: request.needData[i].child_delivery_date && new Date(request.needData[i].child_delivery_date),
        child_id: request.needData[i].child_id,
        confirmDate: request.needData[i].confirmDate && new Date(request.needData[i]?.confirmDate),
        confirmUser: request.needData[i].confirmUser,
        cost: request.needData[i].cost,
        created: request.needData[i].created && new Date(request.needData[i]?.created),
        created_by_id: request.needData[i].created_by_id,
        deleted_at: request.needData[i].deleted_at && new Date(request.needData[i]?.deleted_at),
        description: request.needData[i].description, // { en: '' , fa: ''}
        description_translations: request.needData[i].description_translations,  // { en: '' , fa: ''}
        title_translations: request.needData[i].title_translations,
        details: request.needData[i].details,
        doing_duration: request.needData[i].doing_duration,
        donated: request.needData[i].donated,
        doneAt: request.needData[i].doneAt && new Date(request.needData[i]?.doneAt),
        expected_delivery_date: request.needData[i].expected_delivery_date && new Date(request.needData[i]?.expected_delivery_date),
        informations: request.needData[i].informations,
        isConfirmed: request.needData[i].isConfirmed,
        isDeleted: request.needData[i].isDeleted,
        isDone: request.needData[i].isDone,
        isReported: request.needData[i].isReported,
        isUrgent: request.needData[i].isUrgent,
        ngoId: request.needData[i].ngoId,
        ngoAddress: request.needData[i].ngoAddress,
        ngoName: request.needData[i].ngoName,
        ngo_delivery_date: request.needData[i].ngo_delivery_date && new Date(request.needData[i]?.ngo_delivery_date),
        oncePurchased: request.needData[i].oncePurchased,
        paid: request.needData[i].paid,
        purchase_cost: request.needData[i].purchase_cost,
        purchase_date: request.needData[i].purchase_date && new Date(request.needData[i]?.purchase_date),
        receipt_count: request.needData[i].receipt_count,
        receipts: request.needData[i].receipts,
        status: request.needData[i].status,
        status_description: request.needData[i].status_description,
        status_updated_at: request.needData[i].status_updated_at && new Date(request.needData[i]?.status_updated_at),
        type: request.needData[i].type,
        type_name: request.needData[i].type_name,
        unavailable_from: request.needData[i].unavailable_from && new Date(request.needData[i]?.unavailable_from),
        unconfirmed_at: request.needData[i].unconfirmed_at && new Date(request.needData[i]?.unconfirmed_at),
        unpaid_cost: request.needData[i].unpaid_cost,
        unpayable: request.needData[i].unpayable,
        unpayable_from: request.needData[i].unpayable_from && new Date(request.needData[i]?.unpayable_from),
        updated: request.needData[i].updated && new Date(request.needData[i]?.updated),
        payments: request.needData[i].payments, // []
        imageUrl: request.needData[i].imageUrl,
        need_retailer_img: request.needData[i].need_retailer_img,
      });

      need.participants = userList
      this.needRepository.save(need)
      console.log('------------------damn create-----------')
      // console.log(userList)
      // console.log(need.participants)
      list.push(need)

    }

    return list;
  }
}


