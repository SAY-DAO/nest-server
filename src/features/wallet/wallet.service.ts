import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { FindManyOptions, Repository } from 'typeorm';
import {
  Domain,
  SwSignatureResult,
  NeedTypeEnum,
  CategoryDefinitionPersianEnum,
  CategoryEnum,
  SwProductVoucher,
  SwServiceVoucher,
  SAYPlatformRoles,
  serviceSignatureTypes,
  productSignatureTypes,
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
import { daysDifference, getSAYRolePersian } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { from, Observable } from 'rxjs';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import {
  fetchProductMessageContent,
  fetchProductMessageContent_legacy,
  fetchServiceMessageContent,
  fetchServiceMessageContent_legacy,
} from 'src/utils/signatures';

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
        need: {
          variables: true,
        },
      },
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
  async getUserSignatures(
    options: FindManyOptions<SignatureEntity>,
    flaskUserId: number,
  ): Promise<[SignatureEntity[], number]> {
    return await this.signatureRepository.findAndCount({
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
      take: options.take,
      skip: options.skip,
    });
  }

  async getSignatures(
    options: FindManyOptions<SignatureEntity>,
  ): Promise<[SignatureEntity[], number]> {
    return await this.signatureRepository.findAndCount({
      relations: {
        need: {
          verifiedPayments: true,
          statusUpdates: true,
          receipts: true,
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
      where: {
        role: SAYPlatformRoles.SOCIAL_WORKER,
      },
      order: { createdAt: 'DESC' },
      take: options.take,
      skip: options.skip,
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
    flaskUserId: number,
  ): Promise<SwSignatureResult> {
    const needRoles = {
      socialWorker: need.socialWorker.flaskUserId,
      auditor: need.auditor.flaskUserId,
      purchaser: need.purchaser.flaskUserId,
      familyMembers: need.verifiedPayments.map((p) => p.flaskUserId),
    };
    let role: string;
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
    let serviceResult: {
      serviceVoucher: SwServiceVoucher;
      serviceTypes: serviceSignatureTypes;
    };
    let productResult: {
      productVoucher: SwProductVoucher;
      productTypes: productSignatureTypes;
    };
    const swSignature =
      need.signatures &&
      need.signatures.find(
        (s) => s.flaskUserId === need.socialWorker.flaskUserId,
      );

    // define your data types
    if (need.type === NeedTypeEnum.PRODUCT) {
      console.log(daysDifference(swSignature.createdAt, new Date('2023-09-27')) >= 0);
      
      if (
        swSignature &&
        daysDifference(swSignature.createdAt, new Date('2023-09-27')) >= 0
      ) {
        // content of the message was changed, we need this to verify older signatures
        productResult = fetchProductMessageContent_legacy(
          need,
          signerAddress,
          role,
        );
      } else {
        productResult = fetchProductMessageContent(need, signerAddress, role);
      }
    }
    if (need.type === NeedTypeEnum.SERVICE) {
      if (
        swSignature &&
        daysDifference(swSignature.createdAt, new Date('2023-09-27')) >= 0
      ) {
        // content of the message was changed, we need this to verify older signatures
        serviceResult = fetchServiceMessageContent_legacy(
          need,
          signerAddress,
          role,
        );
      } else {
        serviceResult = fetchServiceMessageContent(need, signerAddress, role);
      }
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
      message: productResult.productVoucher || serviceResult.serviceVoucher,
      types:
        need.type === NeedTypeEnum.PRODUCT
          ? productResult.productTypes
          : serviceResult.serviceTypes,
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
