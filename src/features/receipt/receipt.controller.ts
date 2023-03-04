import { Controller, Get, Param, Query, Req } from '@nestjs/common';
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

    @Get(`flask/need/:needId`)
    @ApiOperation({ description: 'Get all needs from flask' })
    async getFlaskNeeds(
        @Req() req: Request,
        @Param('needId') needId: number
    ) {
        const accessToken = req.headers['authorization'];
        return await this.receiptService.getFlaskReceipts(
            {
                accessToken: accessToken,
            },
            needId,

        );
    }
}
