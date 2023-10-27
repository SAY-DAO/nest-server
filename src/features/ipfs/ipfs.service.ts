import { Injectable, Logger } from '@nestjs/common';
import { NFTStorage, File } from 'nft.storage';
import mime from 'mime';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { Token } from 'nft.storage/dist/src/lib/interface';
import { SAYPlatformRoles } from 'src/types/interfaces/interface';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { ChildrenService } from '../children/children.service';
import { PaymentService } from '../payment/payment.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { DownloadService } from '../download/download.service';
import fs from 'fs';

@Injectable()
export class IpfsService {
  constructor(
    private httpService: HttpService,
    private childrenService: ChildrenService,
    private paymentService: PaymentService,
    private downloadService: DownloadService,
    @InjectRepository(IpfsEntity)
    private ipfsRepository: Repository<IpfsEntity>,
  ) {}

  private readonly logger = new Logger(IpfsService.name);

  async getAllIpfs(): Promise<IpfsEntity[]> {
    return this.ipfsRepository.find();
  }

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
        flaskNeedId,
      },
    });
  }

  async handleIpfs(signature: string, need: NeedEntity) {
    const unlinkList = [];
    const endpoint = new URL('https://api.nft.storage');
    const token = process.env.NFT_STORAGE_KEY;
    const client = new NFTStorage({ endpoint, token });
    if (!need) {
      throw new ObjectNotFound();
    }
    if (need.ipfs) {
      throw new WalletExceptionFilter(403, 'Need has an IPFS hash!');
    }
    let dataNeed: Token<{ image: any; name: string; description: string }>;
    // Need
    try {
      console.log('\x1b[36m%s\x1b[0m', `1- Storing child to IPFS...`);
      const child = await this.childrenService.getChildById(need.child.flaskId);
      if (!child) {
        throw new WalletExceptionFilter(403, 'Child could not be found!');
      }
      let awakeImage: any;
      let sleptImage: any;
      unlinkList.push(`./${child.sayName}Awake.jpg`);
      if (child.awakeAvatarUrl) {
        // Awake avatar
        awakeImage = await this.fileFromPath(
          child.awakeAvatarUrl,
          `${child.sayName}Awake`,
        );
      }
      unlinkList.push(`./${child.sayName}Slept.jpg`);
      if (child && child.sleptAvatarUrl) {
        // Slept avatar
        sleptImage = await this.fileFromPath(
          child.sleptAvatarUrl,
          `${child.sayName}Slept`,
        );
      }

      const iconImage = await this.fileFromPath(need.imageUrl, `${need.name}`);

      unlinkList.push(`./${need.name}.jpg`);
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
        socialWorkerNotes: need.details ? need.details : '',
        information: need.information ? need.information : '',
        description: need.descriptionTranslations
          ? {
              en: need.descriptionTranslations.en,
              fa: need.descriptionTranslations.fa,
            }
          : 'N/A',
        titles: need.nameTranslations
          ? {
              en: need.nameTranslations.en,
              fa: need.nameTranslations.fa,
            }
          : 'N/A',
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

      // Main need IPFS
      const needContributors = {
        // contributors
        auditorId: need.auditor.contributions.find(
          (c) => c.flaskUserId == need.auditor.flaskUserId,
        ).flaskUserId,
        socialWorkerId: need.socialWorker.contributions.find(
          (c) => c.flaskUserId == need.socialWorker.flaskUserId,
        ).flaskUserId,
        purchaserId: need.purchaser.contributions.find(
          (c) => c.flaskUserId == need.purchaser.flaskUserId,
        ).flaskUserId,
        // family
        // virtualFamilies: [
        //   ...new Map(need.verifiedPayments.map((p) => p.verified && [p.id, p.id_user])).values(),
        // ]
      };

      console.log('\x1b[36m%s\x1b[0m', `2- Storing Need to IPFS...`);
      // console.log({
      //   image: iconImage,
      //   name: need.name,
      //   description: need.descriptionTranslations
      //     ? need.descriptionTranslations.fa
      //     : 'N/A',
      //   properties: {
      //     needDetails,
      //     needDates,
      //     initialSignature: signature,
      //   },
      //   child: {
      //     awakeImage: awakeImage,
      //     sleptImage: sleptImage,
      //     name: {
      //       en: child.sayNameTranslations.en,
      //       fa: child.sayNameTranslations.fa,
      //     },
      //     story: {
      //       en: child.bioTranslations.en,
      //       fa: child.bioTranslations.fa,
      //     },
      //     joined: String(child.created),
      //     cityId: child.city,
      //     countryId: child.country,
      //     nationality: child.nationality,
      //     birthDate: String(child.birthDate),
      //   },
      //   receipt: {
      //     properties: {
      //     },
      //     receipts: need.receipts.map(async r => {
      //       const receiptImage = await this.fileFromPath(
      //         r.attachment,
      //         r.title,
      //       )
      //       return {
      //         image: receiptImage,
      //         name: r.title,
      //         description: r.description,
      //       }
      //     })
      //   },
      //   ngo: {
      //     name: child.ngo.name,
      //     website: child.ngo.website,
      //     cityId: child.ngo.location.flaskCityId,
      //     stateId: child.ngo.location.stateId,
      //     countryId: child.ngo.location.countryId,
      //     countryName: child.ngo.location.countryName,
      //     cityName: child.ngo.location.name,
      //   },
      //   provider: need.provider && {
      //     providerId: need.provider.id,
      //     name: need.provider.name,
      //     website: need.provider.website,
      //   },
      //   contributors: needContributors,

      // })
      dataNeed = await client.store({
        image: iconImage,
        name: need.name,
        description: need.descriptionTranslations
          ? need.descriptionTranslations.fa
          : 'N/A',
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
            fa: child.sayNameTranslations.fa,
          },
          story: {
            en: child.bioTranslations.en,
            fa: child.bioTranslations.fa,
          },
          joined: String(child.created),
          cityId: child.city,
          countryId: child.country,
          nationality: child.nationality,
          birthDate: String(child.birthDate),
        },
        receipt: {
          properties: {},
          receipts: need.receipts.map(async (r) => {
            const receiptImage = await this.fileFromPath(r.attachment, r.title);
            return {
              image: receiptImage,
              name: r.title,
              description: r.description,
            };
          }),
        },
        ngo: {
          name: child.ngo.name,
          website: child.ngo.website,
          cityId: child.ngo.location.flaskCityId,
          stateId: child.ngo.location.stateId,
          countryId: child.ngo.location.countryId,
          countryName: child.ngo.location.countryName,
          cityName: child.ngo.location.name,
        },
        provider: need.provider && {
          providerId: need.provider.id,
          name: need.provider.name,
          website: need.provider.website,
        },
        contributors: needContributors,
      });
      console.log('\x1b[36m%s\x1b[0m', `Stored Need to IPFS...`);

      const status = await client.check(dataNeed.ipnft);
      if (status.pin.status !== null) {
        console.log(status);
      }
      // for (let i = 0; i < unlinkList.length; i++) {
      // console.log(
      //   '\x1b[36m%s\x1b[0m',
      //   `Cleaning ${unlinkList[i]} from local storage ...`,
      // );
      // fs.unlinkSync(unlinkList[i]);
      // }
      console.log(
        '\x1b[36m%s\x1b[0m',
        ' Cleaned last file from local storage!',
      );

      const needIpfs = await this.createIpfs(need, dataNeed.ipnft);

      console.log(
        '\x1b[36m%s\x1b[0m',
        '4- Updated DataBase with IPFS details ...',
      );
      this.logger.log('Stored on IPFS');

      return needIpfs;
    } catch (e) {
      // for (let i = 0; i < unlinkList.length; i++) {
      //   console.log(
      //     '\x1b[36m%s\x1b[0m',
      //     `Cleaning ${unlinkList[i]} from local storage ...`,
      //   );
      //   fs.unlinkSync(unlinkList[i]);
      // }
      console.log(
        '\x1b[36m%s\x1b[0m',
        ' Error: Cleaned last file from local storage!',
      );

      console.log(e);
      throw new ServerError(e.message, e.status);
    }
  }

  async fileFromPath(url: string, name = 'noTitle'): Promise<any> {
    try {
      console.log('Downloading ' + name);

      await this.downloadService.downloadFile(url, `${name}.jpg`);
      const content = await fs.promises.readFile(`${name}.jpg`);
      if (!content) {
        throw new ServerError('could not read the file.');
      }
      const type = mime.getType(`${name}.jpg`);

      const file = new File([content], `${name}`, { type: type });
      console.log('Downloaded !! ' + name);
      return file;
    } catch (e) {
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }
}
