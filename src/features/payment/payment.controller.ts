import { Controller, Get } from '@nestjs/common';
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
}
