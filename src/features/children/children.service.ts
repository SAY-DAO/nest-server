import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenRequest } from '../../types/requests/ChildrenRequest';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
  ) { }

  async getChildren(): Promise<ChildrenEntity[]> {
    return await this.childrenRepository.find();
  }

  async GetChildById(childId: number): Promise<ChildrenEntity> {
    const child = await this.childrenRepository.findOne({
      where: {
        childId: childId,
      },
    });
    const all = await this.getChildren()
    for (let i = 0; i < all.length; i++) {
    }

    return child;
  }

  async syncChildren(request: ChildrenRequest): Promise<ChildrenEntity[]> {
    const list = []
    let thisChild: ChildrenEntity;
    console.log('request--------')
    console.log(request)
    for (let i = 0; i < request.totalChildCount; i++) {
      console.log('createChild')
      console.log(request.childData[i].childId)
      thisChild = await this.childrenRepository.findOne({
        where: {
          childId: request.childData[i].childId,
        },
      });
      if (thisChild) {
        console.log('foundOne')
        console.log(request.childData[i].childId)
        continue;
      }

      const child = await this.childrenRepository.save({
        childId: request.childData[i].childId,
        address: request.childData[i].address,
        avatarUrl: request.childData[i].avatarUrl,
        awakeAvatarUrl: request.childData[i].awakeAvatarUrl,
        bio: request.childData[i].bio,
        bioSummary: request.childData[i].bioSummary,
        bioSummaryTranslations: request.childData[i].bioSummaryTranslations,
        bioTranslations: request.childData[i].bioTranslations,
        birthDate: new Date(request.childData[i].birthDate),
        birthPlace: request.childData[i].birthPlace,
        city: request.childData[i].city,
        confirmDate: new Date(request.childData[i].confirmDate),
        confirmUser: request.childData[i].confirmUser,
        country: request.childData[i].country,
        created: new Date(request.childData[i].created),
        doneNeedsCount: request.childData[i].doneNeedsCount,
        education: request.childData[i].education,
        existence_status: request.childData[i].existence_status,
        familyCount: request.childData[i].familyCount,
        generatedCode: request.childData[i].generatedCode,
        housingStatus: request.childData[i].housingStatus,
        ngoId: request.childData[i].ngoId,
        idSocialWorker: request.childData[i].idSocialWorker,
        isConfirmed: request.childData[i].isConfirmed,
        isDeleted: request.childData[i].isDeleted,
        isMigrated: request.childData[i].isMigrated,
        isGone: request.childData[i].isGone,
        migrateDate: new Date(request.childData[i].migrateDate),
        migratedId: request.childData[i].migratedId,
        nationality: request.childData[i].nationality,
        sayFamilyCount: request.childData[i].sayFamilyCount,
        sayName: request.childData[i].sayName,
        sayname_translations: request.childData[i].sayname_translations,
        sleptAvatarUrl: request.childData[i].sleptAvatarUrl,
        status: request.childData[i].status,
        updated: new Date(request.childData[i].updated),
        voiceUrl: request.childData[i].voiceUrl,
      });
      list.push(child)
    }
    console.log(list)
    return list
  }
}
