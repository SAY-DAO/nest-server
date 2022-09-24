import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { Repository } from 'typeorm';
import { Domain, FamilyVoucher, ProviderType, SocialWorkerVoucher } from '../../types/interface';
import { CreateSignatureDto } from '../../types/dtos/CreateSignature.dto';
import { NeedService } from '../need/need.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(SignatureEntity)
    private signatureRepository: Repository<SignatureEntity>,
    private needService: NeedService,
    private userService: UserService,
    private childService: ChildrenService,
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

  async designDomain(
    verifyContractAddress: string,
    chainId: string,
  ): Promise<Domain> {
    const SIGNING_DOMAIN_NAME = 'SAY-DAO';
    const SIGNING_DOMAIN_VERSION = '1';

    return {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: verifyContractAddress,
      chainId,
    };
  }

  async signTransaction(request: CreateSignatureDto) {
    let SocialWorkerVoucher: SocialWorkerVoucher;
    let FamilyVoucher: FamilyVoucher;
    let types: { Voucher: { name: string; type: string; }[]; };
    const need = await this.needService.getNeedById(request.needId);
    const user = await this.userService.getUser(request.userId);
    const child = await this.childService.getChildById(need.child.childId);

    const isCreator = need.createdById === 13; // request.userId
    const IsParticipant = need.payments.filter(
      (p) => (p.user.userId = request.userId),
    );

    if (isCreator) {
      SocialWorkerVoucher = {
        needId: need.needId,
        userId: user && user.userId || request.userId, // we do not have any users available at begining
        child: child.sayName,
        provider: need.provider && need.provider.name || 'digikala',
        wallet: request.signerAddress,
        content: `Your ${request.impacts} impacts will be ready for a firend to mint!`,
      };
      // define your data types
      types = {
        Voucher: [
          { name: 'needId', type: 'uint256' },
          { name: 'userId', type: 'uint256' },
          { name: 'child', type: 'string' },
          { name: 'provider', type: 'string' },
          { name: 'wallet', type: 'address' },
          { name: 'content', type: 'string' },
        ],
      };
    } else if (IsParticipant) {
      FamilyVoucher = {
        needId: need.needId,
        userId: user && user.userId || request.userId, // we do not have any users available at begining
        child: need.child.childId,
        wallet: request.signerAddress,
        content: `Your ${request.impacts} impacts will be ready for a firend to mint!`,
      };
    }

    console.log(SocialWorkerVoucher);

    const domain = await this.designDomain(
      request.verifyContractAddress,
      request.chainId,
    );



    return {
      SocialWorkerVoucher,
      types,
      domain,
    };
  }
}
