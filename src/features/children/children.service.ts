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

  async GetChildById(child_id: number): Promise<ChildrenEntity> {
    const child = await this.childrenRepository.findOne({
      where: {
        child_id: child_id,
      },
    });
    const all = await this.getChildren()
    for (let i = 0; i < all.length; i++) {
      console.log("all");
      console.log(all[i].child_id);
    }
    console.log("child");
    console.log(child);
    console.log("child_id");
    console.log(child_id);

    return child;
  }

  async createChild(request: ChildrenRequest): Promise<number> {
    for (let i = 0; i < request.childData.length; i++) {
      const thisChild = await this.childrenRepository.findOne({
        where: {
          child_id: request.childData[i].child_id,
        },
      });
      if (thisChild) {
        continue;
      }
      const saved = await this.childrenRepository.save({
        child_id: request.childData[i].child_id,
        address: request.childData[i].address,
        avatarUrl: request.childData[i].avatarUrl,
        awakeAvatarUrl: request.childData[i].awakeAvatarUrl,
        bio: request.childData[i].bio,
        bioSummary: request.childData[i].bioSummary,
        bio_summary_translations: request.childData[i].bio_summary_translations,
        bio_translations: request.childData[i].bio_translations,
        birthDate: new Date(request.childData[i].birthDate),
        birthPlace: request.childData[i].birthPlace,
        city: request.childData[i].city,
        confirmDate: new Date(request.childData[i].confirmDate),
        confirmUser: request.childData[i].confirmUser,
        country: request.childData[i].country,
        created: new Date(request.childData[i].created),
        done_needs_count: request.childData[i].done_needs_count,
        education: request.childData[i].education,
        existence_status: request.childData[i].existence_status,
        familyCount: request.childData[i].familyCount,
        generatedCode: request.childData[i].generatedCode,
        housingStatus: request.childData[i].housingStatus,
        id_ngo: request.childData[i].id_ngo,
        id_social_worker: request.childData[i].id_social_worker,
        isConfirmed: request.childData[i].isConfirmed,
        isDeleted: request.childData[i].isDeleted,
        isMigrated: request.childData[i].isMigrated,
        is_gone: request.childData[i].is_gone,
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
    }
    return request.totalChildCount;
  }
}
