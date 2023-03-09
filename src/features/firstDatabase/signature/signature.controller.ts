import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {  SwSignatureResult } from '../../../types/interface';
import { SwCreateSwSignatureDto } from '../../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-signature.pipe';
import { SignatureService } from './signature.service';
import { SyncService } from '../sync/sync.service';
import { ServerError } from '../../../filters/server-exception.filter';

@ApiTags('Signatures')
@Controller('signatures')
export class SignatureController {
  constructor(
    private signatureService: SignatureService,
    private syncService: SyncService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }

  @Post(`sw/generate`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async swSignTransaction(
    @Req() req: Request,
    @Body(ValidateSignaturePipe) request: SwCreateSwSignatureDto,
  ) {
    let transaction: SwSignatureResult;
    try {
      const accessToken = req.headers['authorization'];
      const { need, child } = await this.syncService.syncNeed(
        accessToken,
        request.callerId,
        request.panelData.need,
        request.childId,
        request.ngoId,
        request.roles,
      );
      transaction = await this.signatureService.swSignTransaction(
        request.signerAddress,
        need,
        child,
      );
      console.log(transaction);
    } catch (e) {
      console.log(e);
      throw new ServerError(e);
    }
    return transaction;
  }
}
