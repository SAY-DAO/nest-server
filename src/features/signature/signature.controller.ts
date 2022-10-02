import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServerError } from '../../filters/server-exception.filter';
import { SwSignatureResult } from '../../types/interface';
import { SwCreateSwSignatureDto } from '../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-signature.pipe';
import { SignatureService } from './signature.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';

@ApiTags('Signature')
@Controller('signature')
export class SignatureController {
  constructor(private signatureService: SignatureService,
    private needService: NeedService,
    private childrenService: ChildrenService,
  ) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }

  @Post(`sw/generate`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async swSignTransaction(@Body(ValidateSignaturePipe) request: SwCreateSwSignatureDto) {
    let transaction: SwSignatureResult;
    try {
      const need = await this.needService.getNeedById(request.flaskNeedId);
      const child = await this.childrenService.getChildById(need.flaskChildId);
      const isCreator = need.createdById === request.flaskSwId; // request.userId
      if (isCreator) {

        const list = [];
        for (let i = 0; i < need.receipts.length; i++) {
          list.push(need.receipts[i].title);
        }
        const receiptsTitles = list[0]
          ? list.join(', ')
          : 'No receipts is provided!';
        transaction = await this.signatureService.swSignTransaction(request, need, child, receiptsTitles);
      }
    } catch (e) {
      console.log(e)
      throw new ServerError(e);
    }
    return transaction;
  }
}
