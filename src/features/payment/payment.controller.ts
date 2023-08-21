import { Controller, Get, Param } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs payments' })
  async getPayments() {
    return await this.paymentService.getPayments();
  }

  @Get(`flask/all/:flaskNeedId`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getFlaskNeedPayments(@Param('flaskNeedId') flaskNeedId: number) {
    return await this.paymentService.getFlaskNeedPayments(flaskNeedId);
  }
}
