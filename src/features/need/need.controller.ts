import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';
import {
  CONTRIBUTION_COEFFICIENT,
  Q1_LOWER_COEFFICIENT,
  Q1_TO_Q2_COEFFICIENT,
  Q2_TO_Q3_COEFFICIENT,
  Q3_UPPER_COEFFICIENT,
  daysDifference,
} from 'src/utils/helpers';
import { PaymentService } from '../payment/payment.service';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { mean, quantileSeq, round } from 'mathjs';
import { SAY_DAPP_ID } from 'src/types/interfaces/interface';

@ApiTags('Needs')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
    private userService: UserService,
    private paymentService: PaymentService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds() {
    return await this.needService.getNeeds();
  }

  @Get(`delete/candidates`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getCandidates() {
    return await this.needService.getDeleteCandidates();
  }

  // @Delete(`all/old`)
  // @ApiOperation({ description: 'Get all needs from db 1' })
  // async deleteOldNeeds() {
  //   return await this.needService.getConfirmedNeeds();
  // }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getRandomNeed() {
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/arriving/:code`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskNeedsByDeliveryCode(@Param('code') code: string) {
    return await this.needService.getFlaskNeedsByDeliveryCode(code);
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(@Param('id') id: number) {
    return await this.needService.getFlaskNeed(id);
  }

  @Get(`preneeds`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const accessToken = req.headers['authorization'];
    const preNeeds = await this.needService.getFlaskPreNeed(accessToken);
    return preNeeds;
  }

  @Get(`unconfirmed/:swId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNotConfirmedNeeds(@Param('swId') socialWorkerId: number) {
    const socialWorker = await this.userService.getFlaskSocialWorker(
      socialWorkerId,
    ); // sw ngo
    return await this.needService.getNotConfirmedNeeds(socialWorkerId, null, [
      socialWorker.ngo_id,
    ]);
  }

  @Get('duplicates/:flaskChildId/:flaskNeedId')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async getDuplicateNeeds(
    @Param('flaskChildId') flaskChildId: number,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    return await this.needService.getDuplicateNeeds(flaskChildId, flaskNeedId);
  }

  @Get(`coefficients/:needId`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeedCoefficients(
    @Param('needId') needId: string,
    @Req() req: Request,
  ) {
    const flaskUserId = req.headers['flaskUserId'];
    const need = await this.needService.getNeedById(needId);

    if (!need.verifiedPayments.find((p) => p.flaskUserId === flaskUserId)) {
      throw new ObjectNotFound('This is not your need!');
    }
    const userPay = need.verifiedPayments.find(
      (p) => p.flaskUserId === flaskUserId,
    );

    let payAmountQGrant: number;
    let payDurationQGrant: number;
    let confirmDurationQGrant: number;
    let logisticDurationQGrant: number;

    const onlyAmountsList = [];
    const onlyPayDurationList = [];
    const onlyConfirmDurationList = [];
    const onlyLogisticDurationList = [];

    // payment duration
    const paymentDuration = daysDifference(need.confirmDate, userPay.created);
    const paymentsInRange = await this.paymentService.getPaymentsInRange(
      userPay.created,
      need.category,
      need.type,
      2,
    );
    paymentsInRange[0].forEach((p) => {
      onlyAmountsList.push(p.need_amount);
      onlyPayDurationList.push(daysDifference(p.need.confirmDate, p.created));
    });

    // confirm duration
    const confirmDuration = daysDifference(need.created, need.confirmDate);
    const confirmsInRange = await this.needService.getConfirmsInRange(
      need.confirmDate,
      need.category,
      need.type,
      2,
    );
    confirmsInRange[0].forEach((c) => {
      onlyConfirmDurationList.push(daysDifference(c.created, c.confirmDate));
    });

    // logistic duration
    const logisticDuration = daysDifference(
      userPay.created,
      need.childDeliveryDate,
    );
    const logisticsInRange = paymentsInRange;
    logisticsInRange[0].forEach((p) => {
      onlyLogisticDurationList.push(
        daysDifference(p.created, p.need.child_delivery_date),
      );
    });

    // payment amount: lower amount means lower grant
    const min_payment_amount = Number(quantileSeq(onlyAmountsList, 0)); //min
    const Q1_payment_amount = Number(quantileSeq(onlyAmountsList, 0.25));
    const Q2_payment_amount = Number(quantileSeq(onlyAmountsList, 0.5));
    const Q3_payment_amount = Number(quantileSeq(onlyAmountsList, 0.75));
    const max_payment_amount = Number(quantileSeq(onlyAmountsList, 1)); // max
    if (0 < userPay.needAmount && userPay.needAmount <= Q1_payment_amount) {
      payAmountQGrant = Q1_LOWER_COEFFICIENT;
    } else if (
      Q1_payment_amount < userPay.needAmount &&
      userPay.needAmount <= Q2_payment_amount
    ) {
      payAmountQGrant = Q1_TO_Q2_COEFFICIENT;
    } else if (
      Q2_payment_amount < userPay.needAmount &&
      userPay.needAmount <= Q3_payment_amount
    ) {
      payAmountQGrant = Q2_TO_Q3_COEFFICIENT;
    } else if (userPay.needAmount > Q3_payment_amount) {
      payAmountQGrant = Q3_UPPER_COEFFICIENT;
    }

    // payment duration: lower duration means higher grant
    const min_payment_duration = Number(quantileSeq(onlyPayDurationList, 0)); //min
    const Q1_payment_duration = Number(quantileSeq(onlyPayDurationList, 0.25));
    const Q2_payment_duration = Number(quantileSeq(onlyPayDurationList, 0.5));
    const Q3_payment_duration = Number(quantileSeq(onlyPayDurationList, 0.75));
    const max_payment_duration = Number(quantileSeq(onlyPayDurationList, 1)); // max
    if (paymentDuration > Q3_payment_duration) {
      payDurationQGrant = Q1_LOWER_COEFFICIENT;
    } else if (
      Q2_payment_duration < paymentDuration &&
      paymentDuration <= Q3_payment_duration
    ) {
      payDurationQGrant = Q1_TO_Q2_COEFFICIENT;
    } else if (
      Q1_payment_duration < paymentDuration &&
      paymentDuration <= Q2_payment_duration
    ) {
      payDurationQGrant = Q2_TO_Q3_COEFFICIENT;
    } else if (0 < paymentDuration && paymentDuration <= Q1_payment_duration) {
      payDurationQGrant = Q3_UPPER_COEFFICIENT;
    }

    // confirm duration: lower duration means higher grant
    const min_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, 0),
    ); //min
    const Q1_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, 0.25),
    );
    const Q2_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, 0.5),
    );
    const Q3_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, 0.75),
    );
    const max_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, 1),
    ); // max
    if (confirmDuration > Q3_confirm_duration) {
      confirmDurationQGrant = Q1_LOWER_COEFFICIENT;
    } else if (
      Q2_confirm_duration < confirmDuration &&
      confirmDuration <= Q3_confirm_duration
    ) {
      confirmDurationQGrant = Q1_TO_Q2_COEFFICIENT;
    } else if (
      Q1_confirm_duration < confirmDuration &&
      confirmDuration <= Q2_confirm_duration
    ) {
      confirmDurationQGrant = Q2_TO_Q3_COEFFICIENT;
    } else if (0 < confirmDuration && confirmDuration <= Q1_confirm_duration) {
      confirmDurationQGrant = Q3_UPPER_COEFFICIENT;
    }

    // logistic duration: lower duration means higher grant
    const min_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, 0),
    ); //min
    const Q1_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, 0.25),
    );
    const Q2_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, 0.5),
    );
    const Q3_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, 0.75),
    );
    const max_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, 1),
    ); // max
    if (logisticDuration > Q3_logistic_duration) {
      logisticDurationQGrant = Q1_LOWER_COEFFICIENT;
    } else if (
      Q2_logistic_duration < logisticDuration &&
      logisticDuration <= Q3_logistic_duration
    ) {
      logisticDurationQGrant = Q1_TO_Q2_COEFFICIENT;
    } else if (
      Q1_logistic_duration < logisticDuration &&
      logisticDuration <= Q2_logistic_duration
    ) {
      logisticDurationQGrant = Q2_TO_Q3_COEFFICIENT;
    } else if (
      0 < logisticDuration &&
      logisticDuration <= Q1_logistic_duration
    ) {
      logisticDurationQGrant = Q3_UPPER_COEFFICIENT;
    }
    const payments = need.verifiedPayments.filter(
      (p) => p.flaskUserId !== SAY_DAPP_ID && p.needAmount > 0,
    );
    const contributionRatio =
      payments.length > 1
        ? (payments.length - 1) * CONTRIBUTION_COEFFICIENT
        : 1;

    return {
      needLogisticDuration: {
        logisticDurationQGrant,
        logisticDuration,
        min_logistic_duration,
        Q1_logistic_duration,
        Q2_logistic_duration,
        Q3_logistic_duration,
        max_logistic_duration,
      },
      needConfirmDuration: {
        confirmDurationQGrant,
        confirmDuration,
        min_confirm_duration,
        Q1_confirm_duration,
        Q2_confirm_duration,
        Q3_confirm_duration,
        max_confirm_duration,
      },
      needPaymentDuration: {
        payDurationQGrant,
        paymentDuration,
        min_payment_duration,
        Q1_payment_duration,
        Q2_payment_duration,
        Q3_payment_duration,
        max_payment_duration,
      },
      needPaymentAmount: {
        payAmountQGrant,
        needAmount: userPay.needAmount,
        min_payment_amount,
        Q1_payment_amount,
        Q2_payment_amount,
        Q3_payment_amount,
        max_payment_amount,
      },
      avgGrant: round(
        mean([
          logisticDurationQGrant,
          confirmDurationQGrant,
          payDurationQGrant,
          payAmountQGrant,
        ]),
        2,
      ),
      contributionRatio,
      // onlyAmountsList,
      // onlyPayDurationList,
      // onlyConfirmDurationList,
      // onlyLogisticDurationList,
    };
  }
}
