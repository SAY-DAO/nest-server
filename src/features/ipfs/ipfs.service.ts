import { Injectable, Logger } from '@nestjs/common';
import { NFTStorage, File } from 'nft.storage';
import fs, { createWriteStream } from 'fs';
import mime from 'mime';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    IpfsEntity,
} from 'src/entities/ipfs.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { Token } from 'nft.storage/dist/src/lib/interface';
import { catchError, lastValueFrom, map } from 'rxjs';
import { SAYPlatformRoles } from 'src/types/interfaces/interface';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { ChildrenService } from '../children/children.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class IpfsService {
    constructor(
        private httpService: HttpService,
        private childrenService: ChildrenService,
        private paymentService: PaymentService,
        @InjectRepository(IpfsEntity)
        private ipfsRepository: Repository<IpfsEntity>,

    ) { }

    private readonly logger = new Logger(IpfsService.name);

    async createIpfs(
        need: NeedEntity,
        needDetailsHash: string,
    ): Promise<IpfsEntity> {
        const newIpfs = this.ipfsRepository.create({
            flaskNeedId: need.flaskId,
            needDetailsHash,
            need,
        });
        return this.ipfsRepository.save(newIpfs);
    }

    getNeedIpfs(flaskNeedId: number) {
        return this.ipfsRepository.findOne({
            where: {
                flaskNeedId
            },
            relations: {
                signatures: true
            }
        })
    }

    async handleIpfs(
        signature: string,
        role: SAYPlatformRoles,
        callerFlaskId: number,
        need: NeedEntity,
    ) {
        const unlinkList = []

        const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
        if (!need) {
            throw new ObjectNotFound();
        }
        if (need.ipfs) {
            return need.ipfs;
        }


        let dataNeed: Token<{ image: any; name: string; description: string }>;
        // Need
        if (need.socialWorker.flaskId !== Number(callerFlaskId)) {
            console.log('\x1b[36m%s\x1b[0m', `1- Storing child to IPFS...`);
            const child = await this.childrenService.getChildById(need.child.flaskId)
            if (!child) {
                throw new WalletExceptionFilter(403, "Child could not be found!")
            }

            let awakeImage: any
            let sleptImage: any
            if (child.awakeAvatarUrl) {
                // Awake avatar
                awakeImage = await this.fileFromPath(
                    child.awakeAvatarUrl,
                    `${child.sayName}Awake`,
                );
                unlinkList.push(`./${child.sayName}Awake.jpg`)


            }
            if (child && child.sleptAvatarUrl) {
                // Slept avatar
                sleptImage = await this.fileFromPath(
                    child.sleptAvatarUrl,
                    `${child.sayName}Slept`,
                );
                unlinkList.push(`./${child.sayName}Slept.jpg`)
            }


            const iconImage = await this.fileFromPath(need.imageUrl, `${need.name}`);
            unlinkList.push(`./${need.name}.jpg`)
            // dates
            const needDates = {
                estimationDays: need.doingDuration,
                updated: String(need.updated),
                created: String(need.created),
                confirmDate: String(need.confirmDate),
                paidDate: String(need.doneAt),
                purchaseDate: String(need.purchaseDate),
                ngoDeliveryDate: String(need.ngoDeliveryDate),
                expectedDeliveryDate: String(need.expectedDeliveryDate),
                childDeliveryDate: String(need.childDeliveryDate),
            };

            // details
            const needDetails = {
                needId: need.id, // nest id
                childId: need.child.id, // nest id
                ngoId: child.ngo.id, // nest id
                providerId: need.provider.id, // nest id
                socialWorkerNotes: need.details ? need.details : 'N/A',
                information: need.information ? need.information : 'N/A',
                description: need.descriptionTranslations ? {
                    en: need.descriptionTranslations.en,
                    fa: need.descriptionTranslations.fa
                } : 'N/A',
                titles: need.nameTranslations ? {
                    en: need.nameTranslations.en,
                    fa: need.nameTranslations.fa
                } : 'N/A',
                title: need.title,
                isUrgent: need.isUrgent,
                type: need.type,
                category: need.category,
                name: need.name,
                status: need.status,
                link: need.link,
                cost: need.cost,
                purchaseCost: need.purchaseCost,
            };
            console.log('\x1b[36m%s\x1b[0m', `2- Storing Need to IPFS...`);
            // Main need IPFS
            dataNeed = await client.store({
                image: iconImage,
                name: need.name,
                description: need.descriptionTranslations ? need.descriptionTranslations.fa : 'N/A',
                properties: {
                    needDetails,
                    needDates,
                    initialSignature: signature,
                },
                child: {
                    awakeImage: awakeImage,
                    sleptImage: sleptImage,
                    name: {
                        en: child.sayNameTranslations.en,
                        fa: child.sayNameTranslations.fa
                    },
                    story: {
                        en: child.bioTranslations.en,
                        fa: child.bioTranslations.fa
                    },
                    joined: String(child.created),
                    cityId: child.city,
                    countryId: child.country,
                    nationality: child.nationality,
                    birthDate: String(child.birthDate)
                },
                ngo: {
                    name: child.ngo.name,
                    website: child.ngo.website,
                    cityId: child.ngo.city.flaskCityId,
                    stateId: child.ngo.city.stateId,
                    countryId: child.ngo.city.countryId,
                    countryName: child.ngo.city.countryName,
                    cityName: child.ngo.city.name,
                },
                provider: need.provider && {
                    providerId: need.provider.id,
                    name: need.provider.name,
                    website: need.provider.website,
                }

            });
            console.log('\x1b[36m%s\x1b[0m', `Stored Need to IPFS...`);

            for (let i = 0; i < unlinkList.length; i++) {
                console.log('\x1b[36m%s\x1b[0m', `Cleaning ${unlinkList[i]} from local storage ...`);
                fs.unlinkSync(unlinkList[i])
            }
            console.log('\x1b[36m%s\x1b[0m', ' Cleaned last file from local storage!');


            const needIpfs = await this.createIpfs(
                need,
                dataNeed.ipnft,
            );

            console.log(
                '\x1b[36m%s\x1b[0m',
                '4- Updated DataBase with IPFS details ...',
            );
            this.logger.log('Stored on IPFS');
            return needIpfs;
        }
        if (role === SAYPlatformRoles.AUDITOR) {
        }
        if (role === SAYPlatformRoles.PURCHASER) {
        }
        const receiptsHashList = [];
        if (role === SAYPlatformRoles.FAMILY) {
            const needContributors = {
                // contributors
                auditor: need.auditor,
                auditorSignature: need.auditor,
                socialWorker: need.socialWorker,
                socialWorkerSignature: need.auditor,
                purchaser: need.purchaser,
                purchaserSignature: need.auditor,
            };

            // Receipts
            await this.paymentService.getFlaskNeedPayments(need.flaskId)
            for (let i = 0; i < need.receipts.length; i++) {
                console.log(
                    '\x1b[36m%s\x1b[0m',
                    `1- Storing receipts to IPFS ${i}/${need.receipts.length}...`,
                );
                const receiptImage = await this.fileFromPath(
                    need.receipts[i].attachment,
                    need.receipts[i].title,
                );
                const data = await client.store({
                    image: receiptImage,
                    name: need.receipts[i].title || 'noTitle',
                    description: need.receipts[i].description,
                    properties: {
                        contributors: needContributors,
                    },
                });
                receiptsHashList.push(data.ipnft);
            }
        }
        else {
            throw new WalletExceptionFilter(403, "could not find your role in this need !")
        }



    }

    async fileFromPath(url: string, name = 'noTitle'): Promise<any> {
        try {
            const result = await this.downloadFile(url, `${name}.jpg`);
            const final = await lastValueFrom(result);
            const content = await fs.promises.readFile(`./${name}.jpg`);
            const type = mime.getType(`./${name}.jpg`);
            const file = new File([content], `${name}`, { type });
            return file;
        } catch (e) {
            throw new WalletExceptionFilter(e.status, e.message)
        }
    }

    downloadFile(fileUrl: string, outputLocationPath: string) {
        const writer = createWriteStream(outputLocationPath);
        if (fileUrl.startsWith('/')) {
            fileUrl = fileUrl.slice(1);
        }
        return this.httpService
            .get(`https://api.sayapp.company/${fileUrl}`, {
                responseType: 'stream',
                timeout: 80000,
            })
            .pipe(map((res) => res.data?.pipe(writer)))
            .pipe(
                catchError((e) => {
                    console.log({ ...e });
                    throw new WalletExceptionFilter(e.status, e.message);
                }),
            );
    }
}
