import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all needs from flask' })
    async getPayments() {
        return await this.paymentService.getPayments()
    }

    @Get(`flask/all/:flaskNeedId`)
    @ApiOperation({ description: 'Get all needs from flask' })
    async getFlaskNeedPayments(
        @Param('flaskNeedId') flaskNeedId: number
    ) {
        return await this.paymentService.getFlaskNeedPayments(flaskNeedId)
    }
}
