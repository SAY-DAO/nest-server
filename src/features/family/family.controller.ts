import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import {
  FlaskUserTypesEnum,
  SAY_DAPP_ID,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import config from 'src/config';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { findQuartileGrant } from 'src/utils/helpers';
import {
  CONTRIBUTION_COEFFICIENT,
  Q1_LOWER_COEFFICIENT,
  Q1_TO_Q2_COEFFICIENT,
  Q2_TO_Q3_COEFFICIENT,
  Q3_UPPER_COEFFICIENT,
  dateConvertToPersian,
  daysDifference,
} from 'src/utils/helpers';
import { mean, quantileSeq, round } from 'mathjs';
import { ServerError } from 'src/filters/server-exception.filter';
import { PaymentService } from '../payment/payment.service';
import { NeedService } from '../need/need.service';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('Family')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('family')
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private childrenService: ChildrenService,
    private needService: NeedService,
    private paymentService: PaymentService,
  ) {}

  @Get(`my/children/:familyUserId`)
  @ApiOperation({ description: 'Get my children' })
  async getMyFamilies(
    @Req() req: Request,
    @Param('familyUserId') familyUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    return await this.childrenService.getMyChildren(familyUserId);
  }

  @Get(`say/payments`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getSayPayments(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.SAY,
      Number(SAY_DAPP_ID),
    );
  }

  @Get(`roles/ecosystem/payments`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyRolesCompletePays(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    if (panelFlaskUserId) {
      if (
        !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
        panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
      ) {
        throw new ForbiddenException(403, 'You Are not the Super admin');
      }
    }
    const ecoCompletePayQuartile = config().dataCache.theQuartile();
    const ecoCompletePayAsRole = config().dataCache.fetchFamilyAll();
    const rolesCount = config().dataCache.fetchFamilyCount();

    return {
      ecosystem: {
        rolesCount: {
          fathersCount: rolesCount.fathersCount,
          mothersCount: rolesCount.mothersCount,
          amoosCount: rolesCount.amoosCount,
          khalehsCount: rolesCount.khalehsCount,
          daeisCount: rolesCount.daeisCount,
          ammesCount: rolesCount.ammesCount,
          totalCount:
            rolesCount.fathersCount +
            rolesCount.mothersCount +
            rolesCount.amoosCount +
            rolesCount.khalehsCount +
            rolesCount.daeisCount +
            rolesCount.ammesCount,
        },
        rolesPayCount: {
          fathersCompletePay: ecoCompletePayAsRole.fathersData.length,
          mothersCompletePay: ecoCompletePayAsRole.mothersData.length,
          amoosCompletePay: ecoCompletePayAsRole.amoosData.length,
          khalehsCompletePay: ecoCompletePayAsRole.khalehsData.length,
          daeisCompletePay: ecoCompletePayAsRole.daeisData.length,
          ammesCompletePay: ecoCompletePayAsRole.ammesData.length,
          totalCompletePay:
            ecoCompletePayAsRole.fathersData.length +
            ecoCompletePayAsRole.mothersData.length +
            ecoCompletePayAsRole.amoosData.length +
            ecoCompletePayAsRole.khalehsData.length +
            ecoCompletePayAsRole.daeisData.length +
            ecoCompletePayAsRole.ammesData.length,
        },

        ecoCompletePayQuartile,
      },
    };
  }

  @Get(`user/coefficients/:needId`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeedCoefficients(
    @Param('needId') needId: string,
    @Req() req: Request,
  ) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    if (panelFlaskUserId) {
      if (
        !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
        panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
      ) {
        throw new ForbiddenException(403, 'You Are not the Super admin');
      }
    }
    const flaskUserId = req.headers['dappFlaskUserId'];
    const need = await this.needService.getNeedById(needId);

    if (!need.verifiedPayments.find((p) => p.flaskUserId === flaskUserId)) {
      throw new ObjectNotFound('This is not your need!');
    }
    const userPay = need.verifiedPayments.find(
      (p) => p.flaskUserId === flaskUserId && p.needAmount > 0,
    );

    let payAmountQGrant: number;
    let payDurationQGrant: number;
    let confirmDurationQGrant: number;
    let logisticDurationQGrant: number;

    const onlyAmountsList = [];
    const onlyPayDurationList = [];
    const onlyConfirmDurationList = [];
    const onlyLogisticDurationList = [];

    // payment duration + amount
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
      (p) => p.flaskUserId !== SAY_DAPP_ID && p.needAmount > 0 && p.verified,
    );
    const contributionRatio =
      payments.length > 1
        ? (payments.length - 1) * CONTRIBUTION_COEFFICIENT
        : 1;

    if (
      !logisticDurationQGrant ||
      !confirmDurationQGrant ||
      !payDurationQGrant ||
      !payAmountQGrant
    ) {
      throw new ServerError('Something is not right!');
    }
    return {
      needLogisticDuration: {
        logisticDurationQGrant,
        logisticDuration: round(logisticDuration),
        min_logistic_duration: round(min_logistic_duration),
        Q1_logistic_duration: round(Q1_logistic_duration),
        Q2_logistic_duration: round(Q2_logistic_duration),
        Q3_logistic_duration: round(Q3_logistic_duration),
        max_logistic_duration: round(max_logistic_duration),
      },
      needConfirmDuration: {
        confirmDurationQGrant,
        confirmDuration: round(confirmDuration),
        min_confirm_duration: round(min_confirm_duration),
        Q1_confirm_duration: round(Q1_confirm_duration),
        Q2_confirm_duration: round(Q2_confirm_duration),
        Q3_confirm_duration: round(Q3_confirm_duration),
        max_confirm_duration: round(max_confirm_duration),
      },
      needPaymentDuration: {
        payDurationQGrant,
        paymentDuration: round(paymentDuration),
        min_payment_duration: round(min_payment_duration),
        Q1_payment_duration: round(Q1_payment_duration),
        Q2_payment_duration: round(Q2_payment_duration),
        Q3_payment_duration: round(Q3_payment_duration),
        max_payment_duration: round(max_payment_duration),
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

  @Get(`distanceRatio`)
  @ApiOperation({
    description: 'Get virtual family member"s distance ratio',
  })
  async getFamilyDistanceRatio(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];

    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }

    const userAsFather = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.FATHER,
      Number(dappFlaskUserId),
    );
    const userAsMother = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.MOTHER,
      Number(dappFlaskUserId),
    );
    const userAsAmoo = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMOO,
      Number(dappFlaskUserId),
    );
    const userAsKhaleh = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.KHALEH,
      Number(dappFlaskUserId),
    );
    const userAsDaei = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.DAEI,
      Number(dappFlaskUserId),
    );
    const userAsAmme = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMME,
      Number(dappFlaskUserId),
    );

    const myChildren = await this.childrenService.getMyChildren(
      dappFlaskUserId,
    );
    // Check if paid at least one need for all my children
    let childrenStatus: {
      childId: any;
      caredFor: boolean;
      status: number;
      userRole: number;
    };
    const childrenList = [];
    for await (const child of myChildren) {
      const caredFor = await this.familyService.isChildCaredOnce(
        dappFlaskUserId,
        child.id,
      );

      childrenStatus = {
        childId: child.id,
        caredFor: caredFor,
        status: child.existence_status,
        userRole: child.family.members.find(
          (m) => m.id_user === Number(dappFlaskUserId),
        ).flaskFamilyRole,
      };
      childrenList.push(childrenStatus);
    }
    const ecoCompletePayQuartile = config().dataCache.theQuartile();

    const distanceRatio = findQuartileGrant(
      {
        fatherCompletePay: userAsFather[1],
        motherCompletePay: userAsMother[1],
        amooCompletePay: userAsAmoo[1],
        khalehCompletePay: userAsKhaleh[1],
        daeiCompletePay: userAsDaei[1],
        ammeCompletePay: userAsAmme[1],
      },
      childrenList,
      ecoCompletePayQuartile.IQRObject,
    );

    return {
      // be ware that some needs counted more than once (e.g more than 1 participants, amoo, Khaleh paid)
      theUser: {
        fatherCompletePay: userAsFather[1],
        motherCompletePay: userAsMother[1],
        amooCompletePay: userAsAmoo[1],
        daeiCompletePay: userAsDaei[1],
        khalehCompletePay: userAsKhaleh[1],
        ammeCompletePay: userAsAmme[1],
        distanceRatio: distanceRatio,
      },
    };
  }
}
