import { DownloadService } from './download.service';
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiFileResponse } from './api-file-response.decorator';
import { DownloadInterceptor } from './interceptors/download.interceptors';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';

@UseInterceptors(DownloadInterceptor)
@ApiTags('Download')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('buffer/:path')
  @ApiFileResponse('image/png')
  async buffer(
    @Req() req: Request,
    @Param('path') path: string,
    @Res() response: Response,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const file = await this.downloadService.imageBuffer(path);
    response.contentType('image/png');
    response.send(file);
  }

  @Get('stream/:path')
  async stream(
    @Req() req: Request,
    @Param('path') path: string,
    @Res() response: Response,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const file = await this.downloadService.imageStream(path);
    file.pipe(response);
  }

  @Get('streamable/:path')
  async streamable(@Param('path') path: string, @Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const file = await this.downloadService.fileStream(path);
    // or
    // const file = this.downloadService.fileBuffer();
    return new StreamableFile(file); // 👈 supports Buffer and Stream
  }

  @Get('streamable2/:flaskNeedId')
  async streamable2(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.downloadService.fileStream(
      `../midjourney-bot/main/need-images/need-${flaskNeedId}/${flaskNeedId}_1.png`,
    );
  }
}
