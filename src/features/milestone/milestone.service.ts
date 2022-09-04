import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { Repository } from 'typeorm';
import { MileStoneEntity } from '../../entities/milestone.entity';
import { MileStoneRequest } from '../../types/requests/MileStoneRequest';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { EpicService } from '../epic/epic.service';

@Injectable()
export class MilestoneService {
    constructor(
        @InjectRepository(MileStoneEntity)
        private mileRepository: Repository<MileStoneEntity>,
        private epicService: EpicService,
        private childrenService: ChildrenService,
        private needService: NeedService
    ) { }

    async createMileStone(request: MileStoneRequest): Promise<any> {
        let theChild: ChildrenEntity;
        console.log(request)

        for (let i = 0; i < request.epics.length; i++) {
            let theNeed = await this.needService.GetNeedById(request.epics[i].need_id)
            console.log(i)
            console.log(theNeed)
            if (!theChild) {
                theChild = await this.childrenService.GetChildById(theNeed.child_id)
            }
            let epic = await this.epicService.createEpic(request.epics);



        }
        // let mileStone = await this.mileRepository.save({
        // child: theChild,
        // epics
        // });

        // need.participants = userList
        // this.needRepository.save(need)
        // console.log('------------------damn create-----------')
        // // console.log(userList)
        // // console.log(need.participants)
        // list.push(need)

        // return mileStone;


    }
}