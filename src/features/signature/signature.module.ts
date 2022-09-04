import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from './signature.controller';
import { SignatureEntity } from '../../entities/signature.entity';
import { SignatureService } from './signature.service';

@Module({
  imports: [TypeOrmModule.forFeature([SignatureEntity])],
  controllers: [SignatureController],
  providers: [SignatureService],
})
export class SignatureModule {
  constructor(private signatureService: SignatureService) { }
}
