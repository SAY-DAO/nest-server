import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { Repository } from 'typeorm';
import {
  Domain,
  SwSignatureResult,
  VoucherTypes,
  NeedTypeEnum,
  CategoryDefinitionPersianEnum,
  CategoryEnum,
  SwProductVoucher,
  SwServiceVoucher,
  SAYPlatformRoles,
} from '../../types/interfaces/interface';
import { NeedService } from '../need/need.service';
import VerifyVoucher from '../../contracts/governance/VerifyVoucher.sol/VerifyVoucher.json';
import { verifyVoucher } from '../../contracts/network-settings.json';
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

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(SignatureEntity)
    private signatureRepository: Repository<SignatureEntity>,
    private needService: NeedService,
    private userService: UserService,
    @InjectSignerProvider()
    private readonly ethersSigner: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) { }

  async getSignature(signature: string): Promise<SignatureEntity> {
    return await this.signatureRepository.findOne({
      where: {
        hash: signature,
      },
    });
  }

  async getUserSignatures(flaskUserId: number): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({
      where: {
        flaskUserId,
      },
    });
  }

  async getNeedSignatures(flaskNeedId: number): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({
      where: {
        flaskNeedId,
      },
    });
  }

  async getSignatures(): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({});
  }

  async createSignature(
    signature: string,
    flaskNeedId: number,
    role: SAYPlatformRoles,
    flaskUserId: number,
  ): Promise<SignatureEntity> {
    const user = await this.userService.getUserByFlaskId(flaskUserId);

    const theSignature = this.signatureRepository.create({
      hash: signature,
      role,
      flaskUserId,
      flaskNeedId,
    });
    theSignature.user = user;

    return await this.signatureRepository.save(theSignature);
  }

  async designDomain(
    verifyContractAddress: string,
    signerAddress: string,
  ): Promise<Domain> {
    const SIGNING_DOMAIN_NAME = 'SAY-DAO';
    const SIGNING_DOMAIN_VERSION = '1';

    const wallet = this.ethersSigner.createVoidSigner(signerAddress);

    const verifyingContract = this.ethersContract.create(
      verifyContractAddress,
      VerifyVoucher.abi,
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
      chainId: chainId,
    };
  }

  async prepareSignature(
    signerAddress: string,
    need: NeedEntity,
    child: ChildrenEntity,
    flaskUserId: number,
  ): Promise<SwSignatureResult> {
    const impacts = 4;
    let productVoucher: SwProductVoucher;
    let serviceVoucher: SwServiceVoucher;
    let types: VoucherTypes;
    const socialWorkerId = need.socialWorker.contributor.flaskId;
    const auditorId = need.auditor.contributor.flaskId;
    const purchaserId = need.purchaser.contributor.flaskId;

    const role =
      flaskUserId === socialWorkerId
        ? SAYPlatformRoles.SOCIAL_WORKER
        : flaskUserId === auditorId
          ? SAYPlatformRoles.AUDITOR
          : flaskUserId === purchaserId && SAYPlatformRoles.PURCHASER;

    // define your data types
    if (need.type === NeedTypeEnum.SERVICE) {
      serviceVoucher = {
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
        bankTrackId: need.bankTrackId || 'N/A',
        child: child.sayNameTranslations.fa,
        receipts: need.receipts.length,
        wallet: signerAddress,
        role: getSAYRolePersian(role),
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };
      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'paid', type: 'number' },
          { name: 'child', type: 'string' },
          { name: 'bankTrackId', type: 'string' },
          { name: 'receipts', type: 'number' },
          { name: 'wallet', type: 'address' },
          { name: 'role', type: 'string' },
          { name: 'content', type: 'string' },
        ],
      };
    }
    if (need.type === NeedTypeEnum.PRODUCT) {
      productVoucher = {
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
        wallet: signerAddress,
        role: getSAYRolePersian(role), // string human readable
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };
      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'paid', type: 'uint256' },
          { name: 'deliveryCode', type: 'string' },
          { name: 'child', type: 'string' },
          { name: 'wallet', type: 'address' },
          { name: 'role', type: 'string' },
          { name: 'content', type: 'string' },
        ],
      };
    }
    console.log('\x1b[36m%s\x1b[0m', 'Preparing domain for signature ...\n');
    let domain: Domain;
    try {
      domain = await this.designDomain(verifyVoucher, signerAddress);
    } catch (e) {
      throw new WalletExceptionFilter(e.status, e.message);
    }
    console.log('\x1b[36m%s\x1b[0m', 'Prepared the domain! ...\n');

    return {
      SocialWorkerVoucher: productVoucher || serviceVoucher,
      types,
      domain,
      sayRole: role,
    };
  }

  async deleteOne(signature: SignatureEntity): Promise<Observable<any>> {
    return from(this.signatureRepository.delete(signature.id));
  }
}
