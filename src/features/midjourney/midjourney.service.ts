import { Injectable } from '@nestjs/common';
import { MidjourneyEntity } from '../../entities/midjourney.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NeedEntity } from 'src/entities/need.entity';
import { WalletService } from '../wallet/wallet.service';
import fs from 'fs';
import config from 'src/config';
import { checkIfFileOrDirectoryExists, deleteFile } from 'src/utils/file';

@Injectable()
export class MidjourneyService {
  constructor(
    @InjectRepository(MidjourneyEntity)
    private readonly midjourneyRepository: Repository<MidjourneyEntity>,
    private readonly walletService: WalletService,
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
      await this.walletService.getAllFamilyReadyToSignNeeds();
    const list = [];
    const listOfIds = [];
    needWithSignatures.forEach((n) => {
      if (!listOfIds.find((i) => i === n.id)) {
        const data = {
          id: n.id,
          flaskId: n.flaskId,
          link: n.needRetailerImg,
          prompt:
            'only one ' +
            n.nameTranslations.en +
            ', with white background, drawn in manga style, borderless stickers, no graininess, vector, minimal style',
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
}
