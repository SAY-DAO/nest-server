import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';

@ApiTags('Receipts')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('receipt')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getReceipts() {
    return await this.receiptService.getReceipts();
  }

  @Get(`flask/need/:needId`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getFlaskReceipts(@Req() req: Request, @Param('needId') needId: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (panelFlaskUserId) {
      if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    if (dappFlaskUserId) {
      if (isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }

    const accessToken = req.headers['authorization'];
    return await this.receiptService.getFlaskReceipts(
      {
        accessToken: accessToken,
      },
      needId,
    );
  }
}
