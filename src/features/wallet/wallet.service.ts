import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { Repository } from 'typeorm';
import {
  Domain,
  SwSignatureResult,
  NeedTypeEnum,
  CategoryDefinitionPersianEnum,
  CategoryEnum,
  SwProductVoucher,
  SwServiceVoucher,
  SAYPlatformRoles,
} from '../../types/interfaces/interface';
import { NeedService } from '../need/need.service';
import VerifyVoucherContract from '../../contracts/needModule/VerifyVoucher.sol/VerifyVoucher.json';
import { mainnet } from '../../contracts/network-settings.json';
import { ChildrenEntity } from '../../entities/children.entity';
import {
  EthersContract,
  InjectSignerProvider,
  EthersSigner,
} from 'nestjs-ethers';
import { NeedEntity } from 'src/entities/need.entity';
import { getSAYRolePersian } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { from, Observable } from 'rxjs';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { TypedDataField } from 'ethers';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(SignatureEntity)
    private signatureRepository: Repository<SignatureEntity>,
    private needService: NeedService,
    private userService: UserService,
    @InjectSignerProvider()
    private readonly ethersSigner: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) {}

  async getSignature(signature: string): Promise<SignatureEntity> {
    return await this.signatureRepository.findOne({
      where: {
        hash: signature,
        user: {
          wallets: true,
        },
        need: true,
      },
    });
  }

  async getUserSignatures(flaskUserId: number): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({
      where: {
        flaskUserId,
        role: SAYPlatformRoles.SOCIAL_WORKER,
      },
      relations: {
        need: {
          socialWorker: {
            wallets: true,
          },
          purchaser: {
            wallets: true,
          },
          auditor: {
            wallets: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getNeedSignatures(flaskNeedId: number): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({
      where: {
        flaskNeedId,
      },
      relations: {
        need: {
          socialWorker: {
            wallets: true,
          },
          purchaser: {
            wallets: true,
          },
          auditor: {
            wallets: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getSignatures(): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({
      relations: {
        need: {
          verifiedPayments: true,
          statusUpdates: true,
          receipts: true,
          socialWorker: {
            wallets: true,
          },
        },
      },
      where: {
        role: SAYPlatformRoles.SOCIAL_WORKER,
      },
    });
  }

  async getSignaturesFlaskNeedId() {
    return await this.signatureRepository.find({
      select: {
        id: true,
        flaskNeedId: true,
      },
    });
  }

  async designDomain(
    verifyContractAddress: string,
    signerAddress: string,
  ): Promise<Domain> {
    const SIGNING_DOMAIN_NAME = 'SAY-DAO';
    const SIGNING_DOMAIN_VERSION = '1';

    // https://docs.ethers.org/v5/api/signer/#VoidSigner
    const wallet = this.ethersSigner.createVoidSigner(signerAddress);

    const verifyingContract = this.ethersContract.create(
      verifyContractAddress,
      VerifyVoucherContract.abi,
      wallet,
    );
    console.log(`Getting chain id...`);

    // const tx = await verifyingContract.deployed()
    const chainId = await verifyingContract.getChainID();
    console.log(`chainId from signature service: ${chainId}`);

    return {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: verifyingContract.address,
      chainId: chainId.toNumber(),
    };
  }

  async prepareSignature(
    signerAddress: string,
    need: NeedEntity,
    child: ChildrenEntity,
    flaskUserId: number,
  ): Promise<SwSignatureResult> {
    let productVoucher: SwProductVoucher;
    let serviceVoucher: SwServiceVoucher;
    let types: Record<string, Array<TypedDataField>>;

    const needRoles = {
      socialWorker: need.socialWorker.flaskUserId,
      auditor: need.auditor.flaskUserId,
      purchaser: need.purchaser.flaskUserId,
      familyMembers: need.verifiedPayments.map((p) => p.flaskUserId),
    };
    let role;
    const allRoles = [];

    // could have multiple roles e.g. [Auditor, SocialWorker]
    if (needRoles.socialWorker === flaskUserId) {
      role = getSAYRolePersian(SAYPlatformRoles.SOCIAL_WORKER).toString();
      allRoles.push(SAYPlatformRoles.SOCIAL_WORKER);
    }
    if (needRoles.auditor === flaskUserId) {
      role = getSAYRolePersian(SAYPlatformRoles.AUDITOR).toString();
      allRoles.push(SAYPlatformRoles.AUDITOR);
    }
    if (needRoles.purchaser === flaskUserId) {
      role = getSAYRolePersian(SAYPlatformRoles.PURCHASER).toString();
      allRoles.push(SAYPlatformRoles.PURCHASER);
    }
    if (needRoles.familyMembers.includes(flaskUserId)) {
      role = getSAYRolePersian(SAYPlatformRoles.FAMILY).toString();
      allRoles.push(SAYPlatformRoles.FAMILY);
    }
    if (!role) {
      throw new WalletExceptionFilter(
        403,
        'could not find your role in this need!',
      );
    }
    // define your data types
    if (need.type === NeedTypeEnum.SERVICE) {
      serviceVoucher = {
        title: need.title || 'No Title',
        needId: need.flaskId,
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        bankTrackId: need.bankTrackId || 'N/A',
        child: child.sayNameTranslations.fa,
        receipts: need.receipts.length,
        signer: signerAddress,
        role: role, // string human readable
        content: ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`,
      } as const;

      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'paid', type: 'uint256' },
          { name: 'child', type: 'string' },
          { name: 'bankTrackId', type: 'string' },
          { name: 'receipts', type: 'uint256' },
          { name: 'role', type: 'string' },
          { name: 'content', type: 'string' },
        ],
      };
    }
    if (need.type === NeedTypeEnum.PRODUCT) {
      productVoucher = {
        needId: need.flaskId,
        title: need.title || 'No Title',
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        deliveryCode: need.deliveryCode,
        child: child.sayNameTranslations.fa,
        signer: signerAddress,
        role: role, // string human readable
        content: ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`,
      } as const;

      types = {
        Voucher: [
          { name: 'needId', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'paid', type: 'uint256' },
          { name: 'deliveryCode', type: 'string' },
          { name: 'child', type: 'string' },
          { name: 'role', type: 'string' },
          { name: 'content', type: 'string' },
        ],
      };
    }

    console.log('\x1b[36m%s\x1b[0m', 'Preparing domain for signature ...\n');
    let domain: Domain;
    try {
      domain = await this.designDomain(
        mainnet.verifyVoucherAddress,
        signerAddress,
      );
    } catch (e) {
      throw new WalletExceptionFilter(e.status, e.message);
    }
    console.log('\x1b[36m%s\x1b[0m', 'Prepared the domain! ...\n');

    return {
      message: productVoucher || serviceVoucher,
      types,
      domain,
      sayRoles: allRoles,
    };
  }

  async createSignature(
    signature: string,
    flaskNeedId: number,
    role: SAYPlatformRoles,
    flaskUserId: number,
    verifyingContract: string,
    signerAddress: string,
  ): Promise<SignatureEntity> {
    const user = await this.userService.getUserByFlaskId(flaskUserId);
    let theNeed: NeedEntity;
    try {
      theNeed = await this.needService.getNeedByFlaskId(flaskNeedId);
    } catch (e) {}
    const theSignature = this.signatureRepository.create({
      hash: signature,
      role,
      flaskUserId,
      flaskNeedId,
      verifyingContract,
      signerAddress,
    });
    theSignature.user = user;
    theSignature.need = theNeed;

    return await this.signatureRepository.save(theSignature);
  }

  async deleteOne(signatureId): Promise<Observable<any>> {
    return from(this.signatureRepository.delete(signatureId));
  }
}
