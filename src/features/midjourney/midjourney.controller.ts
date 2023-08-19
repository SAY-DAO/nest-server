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
import { MessageBody } from '@nestjs/websockets';
import { FamilyService } from '../family/family.service';

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
    private readonly familyService: FamilyService,
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
    const list = [];
    const needWithSignatures =
      await this.familyService.getAllFamilyReadyToSignNeeds();
    for await (const need of needWithSignatures) {
      const allImages = getAllFilesFromFolder(
        `../midjourney-bot/main/need-images/need-${need.flaskId}`,
      );
      list.push({
        needFlaskId: need.flaskId,
        originalImage: need.needRetailerImg,
        midjourneyImages: allImages,
        selectedImage: need.midjourneyImage,
      });
    }
    return list;
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

  @Post('select/:flaskNeedId')
  @ApiOperation({ description: 'Get all signed' })
  async selectFinalImage(
    @Param('flaskNeedId') flaskNeedId: number,
    @MessageBody() body,
  ) {
    const promptList = this.midjourneyService.selectImage(
      flaskNeedId,
      body.selectedImage,
    );
    return promptList;
  }

  @Get('images/:flaskNeedId/:index')
  async serveAvatar(
    @Param('flaskNeedId') flaskNeedId: number,
    @Param('index') index: number,
    @Res() res: any,
  ): Promise<any> {
    const fileName = `${flaskNeedId}_${index}.png`;
    res.sendFile(fileName, {
      root: `../midjourney-bot/main/need-images/need-${flaskNeedId}`,
    });
  }
}
