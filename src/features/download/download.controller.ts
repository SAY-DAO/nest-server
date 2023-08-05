import { DownloadService } from './download.service';
import {
  Controller,
  Get,
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
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('download')
export class DownloadController {
  constructor(
    private readonly downloadService: DownloadService,
    private readonly httpService: HttpService,
  ) {}

  @ApiFileResponse('image/png')
  @Get('buffer')
  async buffer(@Res() response: Response) {
    const file = await this.downloadService.imageBuffer('dao.png');
    response.contentType('image/png');
    response.send(file);
  }

  @Get('stream')
  async stream(@Res() response: Response) {
    const file = await this.downloadService.imageStream('dao.png');
    file.pipe(response);
  }

  @Get('streamable')
  async streamable(@Res({ passthrough: true }) response: Response) {
    const file = await this.downloadService.fileStream('dao.png');
    // or
    // const file = this.downloadService.fileBuffer();
    return new StreamableFile(file); // 👈 supports Buffer and Stream
  }
}
