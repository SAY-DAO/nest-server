import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../../entities/signature.entity';
import { Repository } from 'typeorm';
import { Domain, FamilyVoucher, ProviderType, SocialWorkerVoucher } from '../../types/interface';
import { SignatureRequest } from '../../types/requests/SignatureRequest';
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

  async signTransaction(request: SignatureRequest) {
    let SocialWorkerVoucher: SocialWorkerVoucher;
    let FamilyVoucher: FamilyVoucher;

    console.log(request);
    const need = await this.needService.GetNeedById(request.needId);
    const user = await this.userService.getUser(request.userId);
    const child = await this.childService.GetChildById(need.child_id);
    console.log(user || request.userId);
    console.log(child);


    const isCreator = need.created_by_id === 13; // request.userId
    const IsParticipant = need.participants.filter(
      (p) => (p.id_user = request.userId),
    );

    if (isCreator) {
      SocialWorkerVoucher = {
        needId: need.need_id,
        userId: user && user.id_user || request.userId, // we do not have any users available at begining
        child: child.sayName,
        provider: need.provider.name,
        wallet: request.signerAddress,
        content: `Your ${request.impacts} impacts will be ready for a firend to mint!`,
      };
    } else if (IsParticipant) {
      FamilyVoucher = {
        needId: need.need_id,
        userId: user && user.id_user || request.userId, // we do not have any users available at begining
        child: need.child_id,
        wallet: request.signerAddress,
        content: `Your ${request.impacts} impacts will be ready for a firend to mint!`,
      };
    }

    console.log(isCreator, IsParticipant);

    console.log(SocialWorkerVoucher);

    const domain = await this.designDomain(
      request.verifyContractAddress,
      request.chainId,
    );
    // define your data types
    const types = {
      Voucher: [
        { name: 'needId', type: 'uint256' },
        { name: 'userId', type: 'uint256' },
        { name: 'needTitle', type: 'string' },
        { name: 'needImage', type: 'string' },
        { name: 'signerAddress', type: 'address' },
        { name: 'content', type: 'string' },
      ],
    };


    return {
      SocialWorkerVoucher,
      types,
      domain,
    };
  }
}
