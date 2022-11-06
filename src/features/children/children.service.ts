import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChildParams } from '../../types/parameters/ChildParameters';
import { Repository } from 'typeorm';
import { ChildrenEntity } from '../../entities/children.entity';
import { NgoEntity } from '../../entities/ngo.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private childrenRepository: Repository<ChildrenEntity>,
  ) { }

  getChildren(): Promise<ChildrenEntity[]> {
    return this.childrenRepository.find();
  }

  getChildById(flaskChildId: number): Promise<ChildrenEntity> {
    const child = this.childrenRepository.findOne({
      where: {
        flaskChildId: flaskChildId,
      },
    });
    return child;
  }

  createChild(childDetails: ChildParams): Promise<ChildrenEntity> {
    const newChild = this.childrenRepository.create({
      flaskChildId: childDetails.flaskChildId,
      sleptAvatarUrl: childDetails.sleptAvatarUrl,
      awakeAvatarUrl: childDetails.awakeAvatarUrl,
      bio: childDetails.bio,
      bioSummary: childDetails.bioSummary,
      bioSummaryTranslations: childDetails.bioSummaryTranslations,
      bioTranslations: childDetails.bioTranslations,
      birthDate: childDetails.birthDate && new Date(childDetails.birthDate),
      birthPlace: childDetails.birthPlace,
      city: childDetails.city,
      confirmDate: childDetails.confirmDate && new Date(childDetails.confirmDate),
      confirmUser: childDetails.confirmUser,
      country: childDetails.country,
      created: childDetails.created && new Date(childDetails.created),
      doneNeedsCount: childDetails.doneNeedsCount,
      education: childDetails.education,
      existenceStatus: childDetails.existence_status,
      familyCount: childDetails.familyCount,
      generatedCode: childDetails.generatedCode,
      housingStatus: childDetails.housingStatus,
      ngo: childDetails.ngo,
      idSocialWorker: childDetails.idSocialWorker,
      isConfirmed: childDetails.isConfirmed,
      isDeleted: childDetails.isDeleted,
      isMigrated: childDetails.isMigrated,
      isGone: childDetails.isGone,
      migrateDate: childDetails.migrateDate && new Date(childDetails.migrateDate),
      migratedId: childDetails.migratedId,
      nationality: childDetails.nationality,
      sayFamilyCount: childDetails.sayFamilyCount,
      sayName: childDetails.sayName,
      sayNameTranslations: childDetails.sayNameTranslations,
      status: childDetails.status,
      updated: childDetails.updated && new Date(childDetails.updated),
      voiceUrl: childDetails.voiceUrl,
    });
    return this.childrenRepository.save(newChild)
  }


}
