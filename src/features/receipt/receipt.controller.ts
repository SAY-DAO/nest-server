import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';

@ApiTags('Receipts')
@Controller('receipt')
export class ReceiptController {
    constructor(private receiptService: ReceiptService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all needs from flask' })
    async getReceipts() {
        return await this.receiptService.getReceipts()
    }
}
