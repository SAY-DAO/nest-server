import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureRequest } from '../../types/requests/SignatureRequest';
import { SignatureService } from './signature.service';

@ApiTags('Signature')
@Controller('signature')
export class SignatureController {
  constructor(private signatureService: SignatureService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }
  @Post(`add`)
  async signTransaction(@Body() { request: data }: { request: SignatureRequest }) {
    const transaction = await this.signatureService.signTransaction(data);
    return transaction;
  }
}
