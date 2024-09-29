import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import config from 'src/config';
import axios from 'axios';
import { ValidatePaymentPipe } from './pipes/validate-campaign.pipe';
import {
  CreateFlaskCartPaymentDto,
  CreateFlaskPaymentDto,
  VerifyFlaskPaymentDto,
} from 'src/types/dtos/CreatePayment.dto';
import { ServerError } from 'src/filters/server-exception.filter';

@ApiTags('Payments')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@UsePipes(new ValidationPipe())
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post(`new`)
  @ApiOperation({ description: 'Create new payment' })
  async newPayment(
    @Req() req: Request,
    @Body(ValidatePaymentPipe) body: CreateFlaskPaymentDto,
  ) {
    const dappFlaskUserId = Number(req.headers['dappFlaskUserId']);

    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const token =
      config().dataCache.fetchDappAuthentication(dappFlaskUserId).token;
    const configs = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    try {
      // create flask payment
      const { data } = await axios.post(
        'https://api.sayapp.company/api/v2/payment',
        {
          need_id: Number(body.needId),
          amount: Number(body.amount),
          donate: Number(body.donation),
          use_credit: Boolean(body.useCredit),
          gateWay: Number(body.gateWay),
        },
        configs,
      );
      console.log(data);
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  @Get(`verify`)
  @ApiOperation({ description: 'Zibal calls this callback' })
  async verifyPayment(
    @Req() req: Request,
    // callback: https://yourcallbackurl.com/callback?trackId=9900&success=1&status=2&orderId=1
    @Query('trackId') trackId: string,
    @Query('orderId') orderId: string,
  ) {
    try {
      const { data } = await axios.get(
        `https://api.sayapp.company/api/v2/payment/verify?trackId=${trackId}&orderId=${orderId}`,
      );
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  @Post(`new/cart`)
  @ApiOperation({ description: 'Create new cart payment' })
  async newCartPayment(
    @Req() req: Request,
    @Body(ValidatePaymentPipe) body: CreateFlaskCartPaymentDto,
  ) {
    const dappFlaskUserId = Number(req.headers['dappFlaskUserId']);

    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const token =
      config().dataCache.fetchDappAuthentication(dappFlaskUserId).token;
    const configs = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    try {
      // create flask payment
      const { data } = await axios.post(
        'https://api.sayapp.company/api/v2/mycart/payment',
        {
          donation: Number(body.donation),
          use_credit: Boolean(body.useCredit),
          gateWay: Number(body.gateWay),
        },
        configs,
      );
      console.log(data);
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  @Get(`verify/cart`)
  @ApiOperation({ description: 'Zibal calls this callback' })
  async verifyCartPayment(
    @Req() req: Request,
    // callback: https://yourcallbackurl.com/callback?trackId=9900&success=1&status=2&orderId=1
    @Query('trackId') trackId: string,
    @Query('orderId') orderId: string,
  ) {
    try {
      const { data } = await axios.get(
        `https://api.sayapp.company/api/v2/mycart/payment/verify?trackId=${trackId}&orderId=${orderId}`,
      );
      return data;
    } catch (e) {
      console.log(e);
    }
  }
  @Get(`all`)
  @ApiOperation({ description: 'Get all needs payments' })
  async getPayments(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.paymentService.getPayments();
  }

  @Get(`user/all/:flaskUserId`)
  @ApiOperation({ description: 'Get all needs payments' })
  async getUserPayments(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.paymentService.getUserPayments(flaskUserId);
  }

  @Get(`all/:flaskNeedId`)
  @ApiOperation({ description: 'Get all need payments' })
  async getNeedPayments(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.paymentService.getNeedPayments(flaskNeedId);
  }

  @Get(`:flaskPaymentId`)
  @ApiOperation({ description: 'Get all need payments' })
  async getPayment(
    @Req() req: Request,
    @Param('flaskPaymentId') flaskPaymentId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.paymentService.getPaymentByFlaskId(flaskPaymentId);
  }

  @Get(`flask/all/:flaskNeedId`)
  @ApiOperation({ description: 'Get all need payments from flask' })
  async getFlaskNeedPayments(
    @Req() req: Request,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.paymentService.getFlaskNeedPayments(flaskNeedId);
  }
}
