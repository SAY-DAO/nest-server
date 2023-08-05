import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';

@ApiTags('Receipts')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
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
    const accessToken = req.headers['authorization'];
    return await this.receiptService.getFlaskReceipts(
      {
        accessToken: accessToken,
      },
      needId,
    );
  }
}
