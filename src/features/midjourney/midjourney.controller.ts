import { Controller, Get, Post, Param, Res } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { WalletService } from '../wallet/wallet.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ServerError } from 'src/filters/server-exception.filter';
import { DownloadService } from '../download/download.service';
import { NeedService } from '../need/need.service';
import { ApiFileResponse } from '../download/api-file-response.decorator';
import { Response as expressResponse } from 'express';
import { getAllFilesFromFolder } from 'src/utils/helpers';

@ApiTags('Midjourney')
// @ApiSecurity('flask-access-token')
// @ApiHeader({
//   name: 'flaskId',
//   description: 'to use cache and flask authentication',
//   required: true,
// })
@Controller('midjourney')
export class MidjourneyController {
  constructor(
    private readonly midjourneyService: MidjourneyService,
    private readonly downloadService: DownloadService,
    private readonly needService: NeedService,
  ) {}

  @Get(`db/all`)
  @ApiOperation({ description: 'Get all IPFS' })
  async getImages() {
    return await this.midjourneyService.getAllImages();
  }

  @Post('db/store/:flaskNeedId')
  @ApiOperation({ description: 'Storing images' })
  async storeImages(@Param('flaskNeedId') flaskNeedId: number): Promise<any> {
    let theImage;
    try {
      const need = await this.needService.getNeedByFlaskId(flaskNeedId);
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

  @Get(`local/all`)
  @ApiOperation({ description: 'Get all IPFS' })
  async getLocalImages() {
    return getAllFilesFromFolder('../midjourney-bot');
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

  @Get('prepare/prompts')
  @ApiOperation({ description: 'Get all signed' })
  async preparePrompts() {
    const promptList = this.midjourneyService.preparePrompts();
    return promptList;
  }
}
