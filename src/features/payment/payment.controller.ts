import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import config from 'src/config';
import axios from 'axios';

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

  @Post(`new`)
  @ApiOperation({ description: 'Get all needs payments' })
  async newPayments(
    @Req() req: Request,
    @Body()
    body: {
      needId: number;
      gateway: number;
      amount: number;
      donate: number;
      useCredit: boolean;
    },
  ) {
    const dappFlaskUserId = Number(req.headers['dappFlaskUserId']);

    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const token =
      config().dataCache.fetchPanelAuthentication(dappFlaskUserId).token;
    const configs = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    // create flask child
    // const { data } = await axios.post(
    //   'https://api.sayapp.company/api/v2/child/add/',
    //   {
    //     needId: body.amount,
    //     amount: body.amount,
    //     donate: body.donate,
    //     useCredit: body.useCredit,
    //   },
    //   configs,
    // );
    console.log(body);
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
