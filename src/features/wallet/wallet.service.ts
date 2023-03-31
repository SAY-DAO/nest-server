import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { Repository } from 'typeorm';
import {
  Domain,
  SwSignatureResult,
  VoucherTypes,
  NeedTypeEnum,
  CategoryDefinitionEnum,
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
  Contract,
  EthersContract,
  InjectSignerProvider,
  EthersSigner,
} from 'nestjs-ethers';
import { NeedEntity } from 'src/entities/need.entity';
import {
  getUserSAYRoleString,
  convertFlaskToSayRoles
} from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { from, Observable } from 'rxjs';
import { IpfsEntity } from 'src/entities/ipfs.entity';

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
        hash: signature
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
        flaskNeedId
      },
    });
  }

  async getSignatures(): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find({});
  }


  async createSignature(
    signature: string,
    ipfs: IpfsEntity,
    flaskNeedId: number,
    role: SAYPlatformRoles,
    flaskUserId: number,
  ): Promise<SignatureEntity> {
    const user = await this.userService.getUserByFlaskId(flaskUserId)
    const need = await this.needService.getNeedByFlaskId(flaskNeedId)

    const theSignature = this.signatureRepository.create({
      hash: signature,
      role,
      flaskUserId,
      flaskNeedId
    });
    theSignature.ipfs = ipfs
    theSignature.user = user
    theSignature.ipfs.need = need

    return await this.signatureRepository.save(theSignature);
  }

  async designDomain(
    verifyContractAddress: string,
    signerAddress: string,
  ): Promise<Domain> {
    const SIGNING_DOMAIN_NAME = 'SAY-DAO';
    const SIGNING_DOMAIN_VERSION = '1';

    const wallet = this.ethersSigner.createVoidSigner(signerAddress);

    const verifyingContract: Contract = this.ethersContract.create(
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

  async swSignTransaction(
    signerAddress: string,
    need: NeedEntity,
    child: ChildrenEntity,
    userTypeId: number,
  ): Promise<SwSignatureResult> {
    const impacts = 4;
    let productVoucher: SwProductVoucher;
    let serviceVoucher: SwServiceVoucher;
    let types: VoucherTypes;

    // define your data types
    if (need.type === NeedTypeEnum.SERVICE) {
      serviceVoucher = {
        title: need.title || 'No Title',
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
              ? CategoryDefinitionEnum.HEALTH
              : need.category === CategoryEnum.JOY
                ? CategoryDefinitionEnum.JOY
                : CategoryDefinitionEnum.SURROUNDING,
        child: child.sayName,
        receipts: 'hi',
        bankTrackId: need.bankTrackId,
        wallet: signerAddress,
        role: getUserSAYRoleString(userTypeId),
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };
      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'child', type: 'string' },
          { name: 'receipts', type: 'string' },
          { name: 'bankTrackId', type: 'string' },
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
            ? CategoryDefinitionEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
              ? CategoryDefinitionEnum.HEALTH
              : need.category === CategoryEnum.JOY
                ? CategoryDefinitionEnum.JOY
                : CategoryDefinitionEnum.SURROUNDING,
        child: child.sayName,
        receipts: 'hi',
        wallet: signerAddress,
        role: getUserSAYRoleString(userTypeId), // string human readable
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };
      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'child', type: 'string' },
          { name: 'receipts', type: 'string' },
          { name: 'wallet', type: 'address' },
          { name: 'role', type: 'string' },
          { name: 'content', type: 'string' },
        ],
      };
    }
    console.log('\x1b[36m%s\x1b[0m', 'Preparing domain for signature ...\n');

    const domain = await this.designDomain(verifyVoucher, signerAddress);
    console.log('\x1b[36m%s\x1b[0m', 'Prepared the domain! ...\n');
    const sayRole = convertFlaskToSayRoles(userTypeId)

    return {
      SocialWorkerVoucher: productVoucher || serviceVoucher,
      types,
      domain,
      sayRole
    };
  }

  async deleteOne(signature: SignatureEntity): Promise<Observable<any>> {
    return from(this.signatureRepository.delete(signature.id));
  }
}
