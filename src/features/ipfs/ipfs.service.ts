import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { NFTStorage, File } from 'nft.storage';
import fs, { createWriteStream } from 'fs';
import mime from 'mime';
import { HttpService } from '@nestjs/axios';
import { NeedService } from '../need/need.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    IpfsChildEntity,
    IpfsEntity,
    IpfsNeedEntity,
} from 'src/entities/ipfs.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { Token } from 'nft.storage/dist/src/lib/interface';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class IpfsService {
    constructor(
        private httpService: HttpService,
        private readonly needService: NeedService,
        @InjectRepository(IpfsEntity)
        private ipfsRepository: Repository<IpfsEntity>,
        @InjectRepository(IpfsNeedEntity)
        private ipfsNeedRepository: Repository<IpfsNeedEntity>,
        @InjectRepository(IpfsChildEntity)
        private ipfsChildRepository: Repository<IpfsChildEntity>,
    ) { }

    private readonly logger = new Logger(IpfsService.name);

    async createIpfs(
        need: NeedEntity,
        awakeAvatarHash: string,
        sleptAvatarHash: string,
        adultAvatarHash: string,
        iconHash: string,
        receiptHashes: string[],
    ): Promise<IpfsEntity> {
        const newChildIpfs = this.ipfsChildRepository.create({
            awakeAvatarHash,
            sleptAvatarHash,
            adultAvatarHash,
        });
        const newNeedIpfs = this.ipfsNeedRepository.create({
            receiptHashes,
            iconHash,
        });
        const childImages = await this.ipfsChildRepository.save(newChildIpfs);
        const needImages = await this.ipfsNeedRepository.save(newNeedIpfs);

        const newIpfs = this.ipfsRepository.create({
            childImages,
            needImages,
            need
        });

        return this.ipfsRepository.save(newIpfs);
    }

    async storeImagesIpfs(needId: string) {
        const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
        const need = await this.needService.getNeedById(needId);
        if (!need) {
            throw new ObjectNotFound()
        }
        if (need.ipfs) {
            console.log(need)
            return need.ipfs
        }

        console.log('\x1b[36m%s\x1b[0m', '1- Creating a files from Urls ...');
        // Receipts
        const receiptsHashList = [];
        for (let i = 0; i < need.receipts.length; i++) {
            const receiptImage = await this.fileFromPath(
                need.receipts[i].attachment,
                need.receipts[i].title,
            );
            console.log(
                '\x1b[36m%s\x1b[0m',
                `2- Storing receipts to IPFS ${i}/${need.receipts.length}...`,
            );
            const data = await client.store({
                image: receiptImage,
                name: need.receipts[i].title || 'noTitle',
                description: need.receipts[i].description,
            });
            receiptsHashList.push(data.ipnft);
        }

        let dataIcon: Token<{ image: any; name: string; description: string; }>
        let dataSlept: Token<{ image: any; name: string; description: string; }>
        let dataAwake: Token<{ image: any; name: string; description: string; }>
        let dataAdult: Token<{ image: any; name: string; description: string; }>

        if (need.imageUrl) {
            console.log('\x1b[36m%s\x1b[0m', `2- Storing Icon to IPFS...`);
            // Icon
            const iconImage = await this.fileFromPath(
                need.imageUrl,
                `${need.name}`,
            );
            dataIcon = await client.store({
                image: iconImage,
                name: need.name || 'noName',
                description: 'Need Icon',
            });
        }

        if (need.child && need.child.sleptAvatarUrl) {
            console.log('\x1b[36m%s\x1b[0m', `2- Storing avatars to IPFS...`);
            // Slept avatar
            const sleptImage = await this.fileFromPath(
                need.child.sleptAvatarUrl,
                `${need.child.sayName}Slept`,
            );
            dataSlept = await client.store({
                image: sleptImage,
                name: `${need.child.sayName}Slept` || 'noName',
                description: 'Slept Avatar',
            });
        }

        if (need.child && need.child.awakeAvatarUrl) {

            // Awake avatar
            const awakeImage = await this.fileFromPath(
                need.child.awakeAvatarUrl,
                `${need.child.sayName}Awake`,
            );
            dataAwake = await client.store({
                image: awakeImage,
                name: `${need.child.sayName}Awake` || 'noName',
                description: 'Awake Avatar',
            });
        }

        if (need.child && need.child.adultAvatarUrl) {

            // Adult avatar
            const adultImage = await this.fileFromPath(
                need.child.adultAvatarUrl,
                `${need.child.sayName}Adult`,
            );
            dataAdult = await client.store({
                image: adultImage,
                name: `${need.child.sayName}Adult` || 'noName',
                description: 'Adult Avatar',
            });
        }

        const needIpfs = await this.createIpfs(
            need,
            dataAwake ? dataAwake.ipnft : 'no hash',
            dataSlept ? dataSlept.ipnft : 'no hash',
            dataAdult ? dataAdult.ipnft : 'no hash',
            dataIcon ? dataIcon.ipnft : 'no hash',
            receiptsHashList,
        );

        console.log(
            '\x1b[36m%s\x1b[0m',
            '4- Updated DataBase with IPFS details ...',
        );

        this.logger.log('Stored on IPFS');
        console.log(needIpfs);
        return needIpfs;
    }

    async fileFromPath(url: string, name = 'noTitle'): Promise<any> {
        try {
            const result = this.downloadFile(url, `${name}.jpg`);
            const fact = await lastValueFrom(result);
            const content = await fs.promises.readFile(`./${name}.jpg`);
            const type = mime.getType(`./${name}.jpg`);
            const file = new File([content], `${name}`, { type });
            console.log('\x1b[36m%s\x1b[0m', ' Cleaning local storage ...');
            fs.unlinkSync(`./${name}.jpg`);
            return file;
        } catch (e) {
            console.log(e);
        }
    }

    downloadFile(fileUrl: string, outputLocationPath: string) {
        console.log(fileUrl)
        console.log(outputLocationPath)
        const writer = createWriteStream(outputLocationPath);
        return this.httpService.get(fileUrl).pipe(
            map((res) => res.data.pipe(writer)),
        ).pipe(
            catchError((e) => {
                console.log(e)
                throw new ForbiddenException('API not available');
            }),
        );
        // return this.httpService
        //     .axiosRef({
        //         url: fileUrl,
        //         method: 'GET',
        //         responseType: 'stream',
        //         timeout: 8000,
        //         headers: {
        //             "Content-Type": 'app'
        //         }
        //     })
        //     .then((response) => {
        //         // ensure that the user can call `then()` only when the file has
        //         // been downloaded entirely.
        //         return new Promise((resolve, reject) => {
        //             response.data.pipe(writer);
        // let error = null;
        // writer.on('error', (err) => {
        //     console.log('err1');
        //     error = err;
        //     writer.close();
        //     reject(err);
        // });
        //             writer.on('close', () => {
        //                 if (!error) {
        //                     resolve(console.log('downloading image is completed!'));
        //                 }
        //                 //no need to call the reject here, as it will have been called in the
        //                 //'error' stream;
        //             });
        //         });
        //     });
    }
}
