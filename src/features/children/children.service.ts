import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildrenInterface } from 'src/entities/interface/children-entity.interface';
import { ServerError } from '../../filters/server-exception.filter';
import { Repository } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { CreateChildrenDto } from '../../types/dtos/CreateChildren.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
  ) { }

  async getChildren(): Promise<ChildrenEntity[]> {
    return await this.childrenRepository.find();
  }

  async getChildById(childId: number): Promise<ChildrenEntity> {
    const child = await this.childrenRepository.findOne({
      where: {
        childId: childId,
      },
    });
    return child;
  }

  async createChild(request: ChildrenInterface): Promise<ChildrenEntity> {
    try {
      return await this.childrenRepository.save({
        childId: request.childId,
        sleptAvatarUrl: request.sleptAvatarUrl,
        awakeAvatarUrl: request.awakeAvatarUrl,
        bio: request.bio,
        bioSummary: request.bioSummary,
        bioSummaryTranslations: request.bioSummaryTranslations,
        bioTranslations: request.bioTranslations,
        birthDate: request.birthDate && new Date(request.birthDate),
        birthPlace: request.birthPlace,
        city: request.city,
        confirmDate: request.confirmDate && new Date(request.confirmDate),
        confirmUser: request.confirmUser,
        country: request.country,
        created: request.created && new Date(request.created),
        doneNeedsCount: request.doneNeedsCount,
        education: request.education,
        existence_status: request.existence_status,
        familyCount: request.familyCount,
        generatedCode: request.generatedCode,
        housingStatus: request.housingStatus,
        ngoId: request.ngoId,
        idSocialWorker: request.idSocialWorker,
        isConfirmed: request.isConfirmed,
        isDeleted: request.isDeleted,
        isMigrated: request.isMigrated,
        isGone: request.isGone,
        migrateDate: request.migrateDate && new Date(request.migrateDate),
        migratedId: request.migratedId,
        nationality: request.nationality,
        sayFamilyCount: request.sayFamilyCount,
        sayName: request.sayName,
        sayNameTranslations: request.sayNameTranslations,
        status: request.status,
        updated: request.updated && new Date(request.updated),
        voiceUrl: request.voiceUrl,
      });
    } catch (e) {
      throw new ServerError(e);
    }
  }

  async syncChildren(request: CreateChildrenDto): Promise<ChildrenEntity[]> {
    const list = []
    let thisChild: ChildrenEntity;
    for (let i = 0; i < request.childData.length; i++) {
      thisChild = await this.childrenRepository.findOne({
        where: {
          childId: request.childData[i].childId,
        },
      });
      if (thisChild) {
        console.log('foundOne')
        continue;
      }

      const child = {
        childId: request.childData[i].childId,
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
        sayNameTranslations: request.childData[i].sayNameTranslations,
        sleptAvatarUrl: request.childData[i].sleptAvatarUrl,
        status: request.childData[i].status,
        updated: new Date(request.childData[i].updated),
        voiceUrl: request.childData[i].voiceUrl,
      };

      await this.createChild(child)
      list.push(child)
    }
    return list
  }
}
