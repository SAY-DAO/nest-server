import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import { createWriteStream } from 'fs';
import axios from 'axios';
import { Readable } from 'stream';
import { prepareUrl } from 'src/utils/helpers';
import { ServerError } from 'src/filters/server-exception.filter';
import mime from 'mime';
import fs from 'fs';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { File } from '@web-std/file';
import readXlsxFile from 'read-excel-file/node';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);
  constructor(private httpService: HttpService) {}

  // Excel
  async excelReadBuffer(path: string) {
    // `rows` is an array of rows
    // each row being an array of cells.
    return readXlsxFile(path);
  }

  async excelStream(path: string) {
    // `rows` is an array of rows
    // each row being an array of cells.
    return readXlsxFile(fs.createReadStream(path));
  }

  async excelFileBuffer(path: string) {
    // `rows` is an array of rows
    // each row being an array of cells.
    return readXlsxFile(Buffer.from(fs.readFileSync(path)));
  }

  // image and files
  async imageReadBuffer(fileName: string) {
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

  async downloadFile(fileUrl: string, path: string) {
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
    const { data } = await axios.get<Readable>(
      !fileUrl.startsWith('http') ? prepareUrl(fileUrl) : fileUrl,
      {
        responseType: 'stream',
      },
    );
    // now, you can process or transform the data as a Readable type.
    const writeStream = createWriteStream(path);
    data.pipe(writeStream); // save file to local file system
    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  async fileFromPath(url: string, name = 'noTitle'): Promise<any> {
    try {
      console.log('Downloading ' + name);
      await this.downloadFile(url, `${name}`);
      const content = await fs.promises.readFile(`${name}`);
      if (!content) {
        throw new ServerError('could not read the file.');
      }
      const type = mime.getType(`${name}`);

      const file = new File([content], `${name}`, { type: type });
      console.log('Downloaded !! ' + name);
      return file;
    } catch (e) {
      console.log(e);
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }
}
