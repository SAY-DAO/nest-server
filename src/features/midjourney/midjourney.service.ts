import { Injectable } from '@nestjs/common';
import { MidjourneyEntity } from '../../entities/midjourney.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from 'src/entities/need.entity';
import fs from 'fs';
import config from 'src/config';
import { checkIfFileOrDirectoryExists, deleteFile } from 'src/utils/file';
import { NeedService } from '../need/need.service';
import { FamilyService } from '../family/family.service';
import { SAYPlatformRoles } from 'src/types/interfaces/interface';
import {
  Paginated,
  PaginateQuery,
  paginate as nestPaginate,
} from 'nestjs-paginate';
import { PaymentEntity } from 'src/entities/payment.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { NgoEntity } from 'src/entities/ngo.entity';

@Injectable()
export class MidjourneyService {
  constructor(
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
    @InjectRepository(MidjourneyEntity)
    private readonly midjourneyRepository: Repository<MidjourneyEntity>,
    private readonly familyService: FamilyService,
    private readonly needService: NeedService,
  ) {}

  async getAllImages(): Promise<MidjourneyEntity[]> {
    return this.midjourneyRepository.find();
  }

  async getImage(flaskNeedId: number): Promise<MidjourneyEntity> {
    return this.midjourneyRepository.findOne({
      where: {
        flaskNeedId: flaskNeedId,
      },
    });
  }

  async createImage(values: {
    flaskNeedId: number;
    need: NeedEntity;
    fileName: string;
  }): Promise<MidjourneyEntity> {
    return this.midjourneyRepository.save({
      flaskNeedId: values.flaskNeedId,
      fileName: values.fileName,
      need: values.need,
    });
  }

  async preparePrompts(): Promise<any> {
    // const needWithSignatures =
    //   await this.familyService.getAllFamilyReadyToSignNeeds();
    const deliveredNeeds = await this.needService.getMidjourneyNeeds();
    await this.familyService.getAllFamilyReadyToSignNeeds();
    const list = [];
    const listOfIds = [];
    deliveredNeeds.forEach((n) => {
      if (!listOfIds.find((i) => i === n.id)) {
        const data = {
          flaskId: n.id,
          needRetailerImg: n.img,
          prompt:
            'write word "SAY" over an unbearably cute, 3d isometric ' +
            n.name_translations.en +
            ',cartoon soft pastel colors illustration, clay render, blender 3d, physically based rendering, soft and light background, pastel background, colorful, toy like proportions --fast',
        };
        list.push(data);
        listOfIds.push(n.id);
      } else {
        console.log(listOfIds);
      }
    });
    config().dataCache.storeMidjourny(list);
    if (checkIfFileOrDirectoryExists('../midjourney-bot/midjourney.json')) {
      deleteFile('../midjourney-bot/midjourney.json');
    }
    fs.appendFile(
      '../midjourney-bot/midjourney.json',
      JSON.stringify(config().dataCache.fetchMidjourney()),
      function (err) {
        if (err) {
          // append failed
        } else {
          // done
        }
      },
    );
    return { total: deliveredNeeds.length, list };
  }

  async selectImage(flaskNeedId: number, selectedImage: string) {
    const need = await this.needService.getNeedByFlaskId(flaskNeedId);
    await this.needService.updateNeedMidjourney(need.id, selectedImage);
    return await this.needService.getNeedByFlaskId(flaskNeedId);
  }

  async getOnlyReadyToMidjourney(
    options: PaginateQuery,
  ): Promise<Paginated<NeedEntity>> {
    const queryBuilder = this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.ngo',
        NgoEntity,
        'ngo',
        'ngo.flaskNgoId = need.flaskNgoId',
      )
      .leftJoinAndMapMany(
        'need.verifiedPayments',
        PaymentEntity,
        'verifiedPayments',
        'verifiedPayments.flaskNeedId = need.flaskId',
      )
      .leftJoinAndMapMany(
        'need.signatures',
        SignatureEntity,
        'signature',
        'signature.flaskNeedId = need.flaskId',
      )
      .where('signature.role = :role', {
        role: SAYPlatformRoles.SOCIAL_WORKER,
      })
      .andWhere('need.midjourneyImage IS NULL');

    return await nestPaginate<NeedEntity>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['createdAt', 'DESC']],
      nullSort: 'last',
    });
  }

  async countAllNeedJourney(): Promise<number> {
    return await this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.ngo',
        NgoEntity,
        'ngo',
        'ngo.flaskNgoId = need.flaskNgoId',
      )
      .leftJoinAndMapMany(
        'need.verifiedPayments',
        PaymentEntity,
        'verifiedPayments',
        'verifiedPayments.flaskNeedId = need.flaskId',
      )
      .leftJoinAndMapMany(
        'need.signatures',
        SignatureEntity,
        'signature',
        'signature.flaskNeedId = need.flaskId',
      )
      .where('signature.role = :role', {
        role: SAYPlatformRoles.SOCIAL_WORKER,
      })
      .getCount();
  }
}
