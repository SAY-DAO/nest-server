import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignatureEntity } from '../entities/signature.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(SignatureEntity)
    private signatureRepository: Repository<SignatureEntity>,
  ) {}

  async getSignatures(): Promise<SignatureEntity[]> {
    return await this.signatureRepository.find();
  }

  async createSignature(signature: string): Promise<SignatureEntity> {
    const saved = await this.signatureRepository.save({
      signature: signature,
    });
    return saved;
  }
}
