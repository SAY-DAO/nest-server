import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import  { createWriteStream } from 'fs';
import { catchError, firstValueFrom } from 'rxjs';
import axios, { AxiosError} from 'axios';
import { Readable } from "stream";

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(private httpService: HttpService) {}

  async imageBuffer(fileName: string) {
    return readFileSync(join(process.cwd(), fileName));
  }

  async imageStream(fileName: string) {
    return createReadStream(join(process.cwd(), fileName));
  }

  async fileBuffer(fileName: string) {
    return readFileSync(join(process.cwd(), fileName));
  }

  async fileStream(fileName: string) {
    return createReadStream(join(process.cwd(), fileName));
  }

  async downloadFile(fileUrl: string, name: string) {
    if (fileUrl.startsWith('/')) {
      fileUrl = fileUrl.slice(1);
    }

    // const response = await this.httpService.axiosRef({
    //   url: `https://api.sayapp.company/${fileUrl}`,
    //   method: 'GET',
    //   responseType: 'stream',
    //   timeout: 80000,
    //   headers:{
    //     Accept: 'text/html,application/xhtml+xml,application/xml'
    //   }
    // });
    // const config = {
    //   headers: {
    //     Accept: 'text/html,application/xhtml+xml,application/xml',
    //     responseType: 'stream',
    //   },
    //   timeout: 80000,
    // };

    // await firstValueFrom(
    //   this.httpService
    //     .get(`https://api.sayapp.company/${fileUrl}`, config)
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         console.log(error);
    //         this.logger.error(error.response.data);
    //         throw 'An error happened!';
    //       }),
    //     ),
    // );
    const { data } = await axios.get<Readable>(`https://api.sayapp.company/${fileUrl}`, {
      responseType: "stream",
    });
    // now, you can process or transform the data as a Readable type.
    const writeStream = createWriteStream(name);
    data.pipe(writeStream); // save file to local file system

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}
