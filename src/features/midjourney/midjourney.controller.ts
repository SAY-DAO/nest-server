import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Req,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ServerError } from 'src/filters/server-exception.filter';
import { DownloadService } from '../download/download.service';
import { NeedService } from '../need/need.service';
import { ApiFileResponse } from '../download/api-file-response.decorator';
import { Response as expressResponse } from 'express';
import { getAllFilesFromFolder } from 'src/utils/helpers';
import { MessageBody } from '@nestjs/websockets';
import { FamilyService } from '../family/family.service';
import { rimraf } from 'rimraf';
import { isAuthenticated } from 'src/utils/auth';
import {
  FlaskUserTypesEnum,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { checkIfFileOrDirectoryExists } from 'src/utils/file';

@ApiTags('Midjourney')
@Controller('midjourney')
export class MidjourneyController {
  constructor(
    private readonly midjourneyService: MidjourneyService,
    private readonly downloadService: DownloadService,
    private readonly needService: NeedService,
    private readonly familyService: FamilyService,
  ) {}

  @Get(`db/all`)
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get all IPFS' })
  async getImages(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.midjourneyService.getAllImages();
  }

  @Post('db/store/:flaskNeedId')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Storing images' })
  async storeImages(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
  ): Promise<any> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
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
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({
    description: 'Get all needs ready to be signed by family',
  })
  async getLocalImages(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;
    const needsWithSignatures =
      await this.midjourneyService.getReadyToSignNeeds({
        page: page,
        limit: limit,
        path: '',
      });

    const list = [];

    needsWithSignatures.data.forEach((theNeed) => {
      if (theNeed) {
        list.push({
          needFlaskId: theNeed.flaskId,
          childFlaskId: theNeed.flaskChildId,
          ngoName: theNeed.ngo.name,
          usersFlaskId: theNeed.verifiedPayments.map((v) => v.flaskUserId),
          originalImage: theNeed.needRetailerImg,
          selectedImage: theNeed.midjourneyImage,
        });
      }
    });
    return list;
  }

  @ApiFileResponse('image/png')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @Get('buffer/:flaskNeedId')
  async buffer(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
    @Res() response: expressResponse,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const theImage = await this.midjourneyService.getImage(flaskNeedId);
    const file = await this.downloadService.imageBuffer(theImage.fileName);
    response.contentType('image/png');
    response.send(file);
  }

  @Get('prepare/prompts')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get all signed' })
  async preparePrompts(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const promptList = await this.midjourneyService.preparePrompts();
    return promptList;
  }

  @Post('select/:flaskNeedId')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get all signed' })
  async selectFinalImage(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
    @MessageBody() body,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
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

  @Delete(`images/:flaskNeedId`)
  @ApiOperation({ description: 'Delete folder of need images' })
  async deleteSignature(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new WalletExceptionFilter(403, 'You Are not the Super admin');
    }

    const path = `../midjourney-bot/main/need-images/need-${flaskNeedId}`;
    if (checkIfFileOrDirectoryExists(path)) {
      const result = await rimraf(path);
      return {
        result,
        flaskNeedId,
        message: `../midjourney-bot/main/need-images/need-${flaskNeedId} is deleted`,
      };
    } else {
      return {
        flaskNeedId,
        message: `Folder does not exist`,
      };
    }
  }
}
