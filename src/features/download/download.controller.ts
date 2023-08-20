import { DownloadService } from './download.service';
import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiFileResponse } from './api-file-response.decorator';
import { DownloadInterceptor } from './interceptors/download.interceptors';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';

@UseInterceptors(DownloadInterceptor)
@ApiTags('Download')
// @ApiSecurity('flask-access-token')
// @ApiHeader({
//   name: 'flaskId',
//   description: 'to use cache and flask authentication',
//   required: true,
// })
@Controller('download')
export class DownloadController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly httpService: HttpService,
  ) {}

  @Get('buffer/:path')
  @ApiFileResponse('image/png')
  async buffer(@Param('path') path: string, @Res() response: Response) {
    const file = await this.downloadService.imageBuffer(path);
    response.contentType('image/png');
    response.send(file);
  }

  @Get('stream/:path')
  async stream(@Param('path') path: string, @Res() response: Response) {
    const file = await this.downloadService.imageStream(path);
    file.pipe(response);
  }

  @Get('streamable/:path')
  async streamable(
    @Param('path') path: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.downloadService.fileStream(path);
    // or
    // const file = this.downloadService.fileBuffer();
    return new StreamableFile(file); // 👈 supports Buffer and Stream
  }

  @Get('streamable2/:flaskNeedId')
  async streamable2(@Param('flaskNeedId') flaskNeedId: string) {
    return await this.downloadService.fileStream(
      `../midjourney-bot/main/need-images/need-${flaskNeedId}/${flaskNeedId}_1.png`,
    );
  }
}
