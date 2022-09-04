import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureService } from './signature.service';

@ApiTags('Signature')
@Controller('dao/signature')
export class SignatureController {
  constructor(private signatureService: SignatureService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }
  @Post(`add`)
  async createTransaction(@Body('data') { signature }) {
    console.log(signature);
    const transaction = await this.signatureService.createSignature(signature);
    return transaction;
  }
}
