import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { createReadStream, readFileSync } from 'fs';
import { join } from 'path';
import fs, { createWriteStream } from 'fs';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class DownloadService {

    constructor(
        private httpService: HttpService,

    ) { }


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
        const writer = fs.createWriteStream(name);
        if (fileUrl.startsWith('/')) {
            fileUrl = fileUrl.slice(1);
        }
        const response = await this.httpService.axiosRef({
            url: `https://api.sayapp.company/${fileUrl}`,
            method: 'GET',
            responseType: 'stream',
            timeout: 80000,
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }


}
