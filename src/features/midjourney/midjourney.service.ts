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

@Injectable()
export class MidjourneyService {
  constructor(
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
    const needWithSignatures =
      await this.familyService.getAllFamilyReadyToSignNeeds();
    const list = [];
    const listOfIds = [];
    needWithSignatures.forEach((n) => {
      if (!listOfIds.find((i) => i === n.id)) {
        const data = {
          id: n.id,
          flaskId: n.flaskId,
          link: n.needRetailerImg,
          prompt:
          'write word "SAY" over an unbearably cute, 3d isometric ' +
            n.nameTranslations.en +
            ',cartoon soft pastel colors illustration, clay render, blender 3d, physically based rendering, soft and light background, pastel background, colorful, toy like proportions --fast',
        };
        list.push(data);
        listOfIds.push(n.id);
      } else {
        console.log(listOfIds);
      }
    });
    config().dataCache.storeMidjourny(list);
    if (checkIfFileOrDirectoryExists('../midjourney-bot/midJourney.json')) {
      deleteFile('../midjourney-bot/midJourney.json');
    }
    fs.appendFile(
      '../midjourney-bot/midJourney.json',
      JSON.stringify(config().dataCache.fetchMidjourney()),
      function (err) {
        if (err) {
          // append failed
        } else {
          // done
        }
      },
    );
    return list;
  }

  async selectImage(flaskNeedId: number, selectedImage: string) {
    const need = await this.needService.getNeedByFlaskId(flaskNeedId);
    return await this.needService.updateNeedMidjourney(need.id, selectedImage);
  }
}
