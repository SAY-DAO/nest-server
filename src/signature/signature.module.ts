import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from '../signature/signature.controller';
import { SignatureEntity } from '../entities/signature.entity';
import { SignatureService } from '../signature/signature.service';

@Module({
  imports: [TypeOrmModule.forFeature([SignatureEntity])],
  controllers: [SignatureController],
  providers: [SignatureService],
})
@Module({})
export class SignatureModule {
  constructor(private signatureService: SignatureService) {}
}
