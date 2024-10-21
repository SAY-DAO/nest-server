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
import { MessageBody } from '@nestjs/websockets';
import { FamilyService } from '../family/family.service';
import { rimraf } from 'rimraf';
import { isAuthenticated } from 'src/utils/auth';
import {
  FlaskUserTypesEnum,
  SUPER_ADMIN_ID_PANEL,
} from 'src/types/interfaces/interface';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { checkIfDirectoryExists } from 'src/utils/file';
import fs from 'fs';
import path from 'path';

@ApiTags('Midjourney')
@Controller('midjourney')
export class MidjourneyController {
  constructor(
    private readonly midjourneyService: MidjourneyService,
    private readonly downloadService: DownloadService,
    private readonly needService: NeedService,
    private readonly familyService: FamilyService,
  ) { }

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
      throw new ForbiddenException('You Are not the Super admin');
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
      throw new ForbiddenException('You Are not the Super admin');
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
      throw new ServerError(e.message, e.status);
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
      throw new ForbiddenException('You Are not the Super admin');
    }

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;
    const needsWithSignatures =
      await this.midjourneyService.getOnlyReadyToMidjourney({
        page: page,
        limit: limit,
        path: '',
      });
    const count = await this.midjourneyService.countAllNeedJourney();

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
    return {
      totalReady: needsWithSignatures.meta.totalItems,
      total: count,
      list,
    };
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
      throw new ForbiddenException('You Are not the Super admin');
    }
    const theImage = await this.midjourneyService.getImage(flaskNeedId);
    const file = await this.downloadService.imageReadBuffer(theImage.fileName);
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
      throw new ForbiddenException('You Are not the Super admin');
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
      throw new ForbiddenException('You Are not the Super admin');
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

  @Delete(`bad/images`)
  @ApiOperation({ description: 'Delete folder of need images' })
  async deleteBadImages(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID_PANEL
    ) {
      throw new WalletExceptionFilter(403, 'You Are not the Super admin');
    }
    let ids;
    const filePath = path.join(__dirname, 'bad-images-to-remove.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
      // Step 2: Parse the data (assuming it's a newline-separated list)
      ids = data.trim().split('\n');
    });

    const list = [];
    for await (const id of ids) {
      const need = await this.needService.getNeedByFlaskId(id);
      if (need) {
        await this.needService.updateNeedMidjourney(need.id, '');
      }

      const path = `../midjourney-bot/main/need-images/need-${id}`;
      if (checkIfDirectoryExists(path)) {
        await rimraf(path);
        list.push(path);
      } else {
        console.log(`Folder does not exist. Skipping...`);
      }
    }
    return list;
  }

  @Delete(`bad/images/:flaskNeedId`)
  @ApiOperation({ description: 'Add need Id to list of delete candidate' })
  async deleteSignature(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID_PANEL
    ) {
      throw new WalletExceptionFilter(403, 'You Are not the Super admin');
    }
    const filePath = 'src/features/midjourney/bad-images-to-remove.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        return;
      }
      try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Add a new element to the list
        jsonData.push(Number(flaskNeedId));

        // Convert the updated data back to JSON format
        const updatedJsonData = JSON.stringify(jsonData, null, 2);

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, updatedJsonData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
          } else {
            console.log('File updated successfully!');
          }
        });
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
      }
    });
  }
}
