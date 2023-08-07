import { Controller, Get, Post, Param, Res } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { WalletService } from '../wallet/wallet.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import fs from 'fs';
import config from 'src/config';
import { checkIfFileOrDirectoryExists, deleteFile } from 'src/utils/file';
import { ServerError } from 'src/filters/server-exception.filter';
import { DownloadService } from '../download/download.service';
import { NeedService } from '../need/need.service';
import { ApiFileResponse } from '../download/api-file-response.decorator';
import { Response as expressResponse } from 'express';
import { getAllFilesFromFolder } from 'src/utils/helpers';

@ApiTags('Midjourney')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('midjourney')
export class MidjourneyController {
  constructor(
    private readonly midjourneyService: MidjourneyService,
    private readonly downloadService: DownloadService,
    private readonly needService: NeedService,
    private readonly walletService: WalletService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all IPFS' })
  async getImages() {
    const all = await this.midjourneyService.getAllImages();
    return all;
  }

  @ApiFileResponse('image/png')
  @Get('buffer/:flaskNeedId')
  async buffer(
    @Param('flaskNeedId') flaskNeedId: number,
    @Res() response: expressResponse,
  ) {
    const theImage = await this.midjourneyService.getImage(flaskNeedId);
    const file = await this.downloadService.imageBuffer(theImage.fileName);
    response.contentType('image/png');
    response.send(file);
  }

  @Post('store/:id')
  @ApiOperation({ description: 'Storing images' })
  async storeImages(@Param('id') id: string): Promise<any> {
    let theImage;
   return  getAllFilesFromFolder('../../midjourney')
    try {
      const need = await this.needService.getNeedById(id);
      theImage = await this.midjourneyService.createImage({
        fileName: '../../midjourney/dao.png',
        flaskNeedId: 2,
        need,
      });
    } catch (e) {
      throw new ServerError(e);
    }
    return theImage;
  }

  @Get('finalize')
  @ApiOperation({ description: 'Get all signed' })
  async findAll() {
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
    if (checkIfFileOrDirectoryExists('midJourney.json')) {
      deleteFile('midJourney.json');
    }
    fs.appendFile(
      'midJourney.json',
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
