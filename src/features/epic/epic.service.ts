import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { Repository } from 'typeorm';
import { EpicRequest } from '../../types/requests/MileStoneRequest';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { EpicEntity } from '../../entities/epic.entity';

@Injectable()
export class EpicService {
    constructor(
        @InjectRepository(EpicEntity)
        private epicRepository: Repository<EpicEntity>,
        private childrenService: ChildrenService,
        private needService: NeedService
    ) { }

    async createEpic(request: EpicRequest[]): Promise<EpicEntity[]> {
        let list = []
        let theChild: ChildrenEntity;
        console.log('----------------------------------------------------------------------')

        for (let i = 0; i < request.length; i++) {
            let theNeed = await this.needService.GetNeedById(request[i].need_id)
            // if (!theChild) {
            //     theChild = await this.childrenService.GetChildById(theNeed.child_id)
            // }
            // console.log(theNeed.child_id)
            // console.log(theChild)

            let epic = await this.epicRepository.save({
                title: request[i].title,
                description: request[i].description,
                dueDate: request[i].dueDate,
                need_id: request[i].need_id,
                need: theNeed,

            });

            list.push(epic)
        }


        return list;


    }
}