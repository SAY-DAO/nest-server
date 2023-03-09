import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../../entities/signature.entity';
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
} from '../../../types/interface';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import VerifyVoucher from '../../../contracts/tokens/ERC721/VerifyVoucher.sol/VerifyVoucher.json';
import { verifyContractAddress } from '../../../contracts/network-settings.json';
import { ChildrenEntity } from '../../../entities/children.entity';
import { UrlJsonRpcProvider, Contract, EthersContract, InjectEthersProvider, InjectSignerProvider, EthersSigner } from 'nestjs-ethers';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import { NeedEntity } from 'src/entities/need.entity';


@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(SignatureEntity)
    private signatureRepository: Repository<SignatureEntity>,
    private needService: NeedService,
    private userService: UserService,
    private childService: ChildrenService,
    @InjectEthersProvider()
    private readonly ethersProvider: UrlJsonRpcProvider,
    @InjectSignerProvider()
    private readonly ethersSigner: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) { }

  async getSignatures(): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find();
  }

  async createSignature(signature: string): Promise<SignatureEntity> {
    const saved = await this.signatureRepository.save({
      hash: signature,
    });
    return saved;
  }

  async designDomain(verifyContractAddress: string, signerAddress: string): Promise<Domain> {
    const SIGNING_DOMAIN_NAME = 'SAY-DAO';
    const SIGNING_DOMAIN_VERSION = '1';

    const wallet = this.ethersSigner.createVoidSigner(
      signerAddress
    );
    const verifyingContract: Contract = this.ethersContract.create(
      verifyContractAddress,
      VerifyVoucher.abi,
      wallet
    );
    console.log(await wallet.getAddress());

    const tx = await verifyingContract.deployed()
    const chainId = await tx.getChainID();
    console.log(chainId)
    console.log(`chainId from signature service: ${chainId}`);

    return {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: verifyingContract.address,
      chainId: chainId,
    };
  }

  async swSignTransaction(signerAddress: string, need: NeedEntity, child: ChildrenEntity
  ): Promise<SwSignatureResult> {
    const impacts = 4;
    let productVoucher: SwProductVoucher
    let serviceVoucher: SwServiceVoucher
    let types: VoucherTypes


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
        childSayName: child.sayName,
        receipts: 'hi',
        bankTrackId: need.bankTrackId,
        signerAddress: signerAddress,
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };
      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'childSayName', type: 'string' },
          { name: 'receipts', type: 'string' },
          { name: 'bankTrackId', type: 'string' },
          { name: 'signerAddress', type: 'address' },
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
        childSayName: child.sayName,
        receipts: 'hi',
        signerAddress: signerAddress,
        content: `Your ${impacts} impacts will be ready for a friend to mint!`,
      };

      types = {
        Voucher: [
          { name: 'title', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'childSayName', type: 'string' },
          { name: 'receipts', type: 'string' },
          { name: 'signerAddress', type: 'address' },
          { name: 'content', type: 'string' },
        ],
      };
    }

    const domain = await this.designDomain(verifyContractAddress, signerAddress);
    console.log(productVoucher || serviceVoucher,)
    return {
      SocialWorkerVoucher: productVoucher || serviceVoucher,
      types,
      domain,
    };
  }

  // async familySignTransaction(request: SwCreateSwSignatureDto): Promise<SwSignatureResult> {
  //   let SocialWorkerVoucher: SocialWorkerVoucher;
  //   let FamilyVoucher: FamilyVoucher;
  //   let types: { Voucher: { name: string; type: string; }[]; };
  //   const need = await this.needService.getNeedByFlaskId(request.flaskNeedId);
  //   const user = await this.userService.getFamily(request.flaskSwId);
  //   const child = await this.childService.getChildById(need.child.childId);

  //   const isCreator = need.createdById === 13; // request.userId
  //   const IsParticipant = need.payments.filter(
  //     (p) => (p.user.userId = request.flaskSwId),
  //   );

  //   const impacts = 4

  //   if (isCreator) {
  //     SocialWorkerVoucher = {
  //       flaskNeedId: need.flaskNeedId,
  //       userId: user && user.userId || request.flaskSwId, // we do not have any users available at begining
  //       child: child.sayName,
  //       provider: need.provider && need.provider.name || 'digikala',
  //       wallet: request.signerAddress,
  //       content: `Your ${impacts} impacts will be ready for a friend to mint!`,
  //     };
  //     // define your data types
  //     types = {
  //       Voucher: [
  //         { name: 'flaskNeedId', type: 'uint256' },
  //         { name: 'userId', type: 'uint256' },
  //         { name: 'child', type: 'string' },
  //         { name: 'provider', type: 'string' },
  //         { name: 'wallet', type: 'address' },
  //         { name: 'content', type: 'string' },
  //       ],
  //     };
  //   } else if (IsParticipant) {
  //     FamilyVoucher = {
  //       flaskNeedId: need.flaskNeedId,
  //       userId: user && user.userId || request.flaskSwId, // we do not have any users available at begining
  //       child: need.child.childId,
  //       wallet: request.signerAddress,
  //       content: `Your ${impacts} impacts will be ready for a friend to mint!`,
  //     };
  //   }

  //   const domain = await this.designDomain(
  //     verifyContractAddress
  //   );

  //   return {
  //     SocialWorkerVoucher,
  //     types,
  //     domain,
  //   };
  // }
}
