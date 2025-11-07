import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import {
  FlaskUserTypesEnum,
  SAY_DAPP_ID,
  VirtualFamilyRole,
} from '../../types/interfaces/interface';
import config from '../../config';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import {
  findQuartileGrant,
  getContributionRatio,
  QUANTILE_25th,
  QUANTILE_50th,
  QUANTILE_75th,
  QUANTILE_max,
  QUANTILE_min,
} from '../../utils/helpers';
import {
  Q1_LOWER_COEFFICIENT,
  Q1_TO_Q2_COEFFICIENT,
  Q2_TO_Q3_COEFFICIENT,
  Q3_UPPER_COEFFICIENT,
  daysDifference,
} from '../../utils/helpers';
import { compareNatural, mean, quantileSeq, round, sort } from 'mathjs';
import { ServerError } from '../../filters/server-exception.filter';
import { PaymentService } from '../payment/payment.service';
import { NeedService } from '../need/need.service';
import { isAuthenticated } from '../../utils/auth';
import { UserService } from '../user/user.service';
import { UserAPIApi } from 'src/generated-sources/openapi';

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
    private userService: UserService,
    private childrenService: ChildrenService,
    private needService: NeedService,
    private paymentService: PaymentService,
  ) {}

  @Get(`/members/me`)
  @ApiOperation({ description: 'Get a family member' })
  async getMe(@Req() req: Request) {
    const accessToken = req.headers['authorization'];

    const userFlaskApi = new UserAPIApi();
    const familyMember = await userFlaskApi.apiV2UserUserIduserIdGet(
      accessToken,
      'me',
    );
    if (!familyMember) {
      throw new ForbiddenException('You Are not the authenticated1');
    }
    let nestUser = await this.userService.getFamilyByFlaskId(familyMember.id);
    if (!nestUser) {
      nestUser = await this.userService.createFamily(familyMember.id);
    }
    return { ...familyMember, isBuilder: nestUser.isBuilder };
  }

  @Get(`/members/:flaskUserId`)
  @ApiOperation({ description: 'Get a family member' })
  async getFlaskVirtualFamily(
    @Req() req: Request,
    @Param('flaskUserId', ParseIntPipe) flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const flaskUser = await this.userService.getFlaskUser(flaskUserId);
    const nestUser = await this.userService.getFamilyByFlaskId(flaskUserId);

    return { ...flaskUser, isBuilder: nestUser && nestUser.isBuilder };
  }

  @Patch('builder/:flaskUserId')
  @ApiOperation({
    description: 'Admin change the builder status of family members',
  })
  async updateBuilderStatus(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ): Promise<any> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    if (flaskUserId == null || Number.isNaN(Number(flaskUserId))) {
      throw new BadRequestException(
        'flaskUserId is required and must be a number',
      );
    }
    let nestFamilyMember = await this.userService.getFamilyByFlaskId(
      flaskUserId,
    );
    if (!nestFamilyMember) {
      nestFamilyMember = await this.userService.createFamily(flaskUserId);
    }

    return await this.familyService.updateBuilderStatus(nestFamilyMember);
  }

  @Get('search')
  async searchUsers(
    @Req() req: Request,
    @Query('q') query: string,
  ): Promise<any> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    if (query.length >= 3) {
      const users = await this.familyService.searchUsers(query);
      return { users };
    }
  }

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
      throw new ForbiddenException('You Are not the Super admin');
    }

    return await this.childrenService.getMyChildren(familyUserId);
  }

  @Get(`say/payments`)
  @ApiOperation({ description: 'Get SAY payments' })
  async getSayPayments(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.familyService.getDoneNeedsByFamilyRole(
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
        throw new ForbiddenException('You Are not authorized');
      }
    } else if (panelFlaskUserId) {
      if (
        !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
        panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
      ) {
        throw new ForbiddenException('You Are not the Super admin');
      }
    } else {
      throw new ForbiddenException('We need the user ID!');
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
        throw new ForbiddenException('You Are not authorized');
      }
    } else if (panelFlaskUserId) {
      if (
        !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
        panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
      ) {
        throw new ForbiddenException('You Are not the Super admin');
      }
    } else {
      throw new ForbiddenException('We need the user ID!');
    }
    const need = await this.needService.getNeedById(needId);
    // get verified payment for user
    if (!need) {
      throw new ObjectNotFound('Could not fetch need!');
    }
    // get verified payment for user
    if (!need.verifiedPayments.find((p) => p.flaskUserId === dappFlaskUserId)) {
      throw new ObjectNotFound('This is not your need!');
    }
    const userPay = need.verifiedPayments.find(
      (p) => p.flaskUserId === dappFlaskUserId && p.needAmount > 0,
    );

    let payAmountQGrant: number;
    let payDurationQGrant: number;
    let confirmDurationQGrant: number;
    let logisticDurationQGrant: number;

    let onlyAmountsList = [];
    let onlyPayDurationList = [];
    let onlyConfirmDurationList = [];
    let onlyLogisticDurationList = [];

    // 1- Get Confirm, amount, Pay duration and logistics in a range of time.
    // 2- We use MATH library to sort and get the quantile
    // 3- Compare the need variables to the quantile values and reward grant.

    // -------------------------------------------------- contributionRatio --------------------------------------------------------------------------
    // If need ws done by more than one person we reward the vFamily collaboration
    // # of vFamily involved * coefficient
    const contributionRatio = getContributionRatio(need.verifiedPayments);

    // -------------------------------------------------- confirm duration -------------------------------- confirmDate - need.created ------------------
    let confirmDuration = daysDifference(need.created, need.confirmDate);
    if (confirmDuration < 0) {
      // some data from 2019 have wrong confirm dates, such as need 35
      confirmDuration = 0;
    }
    // get all confirms in the range of this confirm date, typically range is two months
    const confirmsInRange = await this.needService.getConfirmsInRange(
      need.confirmDate,
      need.category,
      need.type,
      2, //months
    );
    confirmsInRange[0].forEach((c) => {
      onlyConfirmDurationList.push(daysDifference(c.created, c.confirmDate));
    });

    onlyConfirmDurationList = sort(onlyConfirmDurationList, compareNatural);

    // confirm duration: lower duration means higher grant
    const min_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, QUANTILE_min),
    ); //min
    const Q1_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, QUANTILE_25th),
    );
    const Q2_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, QUANTILE_50th),
    );
    const Q3_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, QUANTILE_75th),
    );
    const max_confirm_duration = Number(
      quantileSeq(onlyConfirmDurationList, QUANTILE_max),
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
    // -------------------------------------------------- payment duration + amount --------------------- userPay.created - confirmDate -----------------
    const paymentDuration = daysDifference(need.confirmDate, userPay.created);
    // get all payments in the range of this payment, typically range is two months
    const paymentsInRange = await this.paymentService.getPaymentsInRange(
      userPay.created,
      need.category,
      need.type,
      2, //months
    );
    paymentsInRange[0].forEach((p) => {
      onlyAmountsList.push(p.need_amount);
      onlyPayDurationList.push(daysDifference(p.need.confirmDate, p.created));
    });

    onlyAmountsList = sort(onlyAmountsList, compareNatural);
    // payment amount: lower amount means lower grant
    const min_payment_amount = Number(
      quantileSeq(onlyAmountsList, QUANTILE_min),
    ); //min
    const Q1_payment_amount = Number(
      quantileSeq(onlyAmountsList, QUANTILE_25th),
    );
    const Q2_payment_amount = Number(
      quantileSeq(onlyAmountsList, QUANTILE_50th),
    );
    const Q3_payment_amount = Number(
      quantileSeq(onlyAmountsList, QUANTILE_75th),
    );
    const max_payment_amount = Number(
      quantileSeq(onlyAmountsList, QUANTILE_max),
    ); // max
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

    onlyPayDurationList = sort(onlyPayDurationList, compareNatural);
    // payment duration: lower duration means higher grant
    const min_payment_duration = Number(
      quantileSeq(onlyPayDurationList, QUANTILE_min),
    ); //min
    const Q1_payment_duration = Number(
      quantileSeq(onlyPayDurationList, QUANTILE_25th),
    );
    const Q2_payment_duration = Number(
      quantileSeq(onlyPayDurationList, QUANTILE_50th),
    );
    const Q3_payment_duration = Number(
      quantileSeq(onlyPayDurationList, QUANTILE_75th),
    );
    const max_payment_duration = Number(
      quantileSeq(onlyPayDurationList, QUANTILE_max),
    ); // max
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

    // -------------------------------------------------- logistic duration -------------------------- childDeliveryDate - userPay.created -------------
    const logisticDuration = daysDifference(
      userPay.created,
      need.childDeliveryDate,
    );
    // get all logisticDuration in the range of this logisticDuration, typically range is two months
    const logisticsInRange = paymentsInRange;
    logisticsInRange[0].forEach((p) => {
      onlyLogisticDurationList.push(
        daysDifference(p.created, p.need.child_delivery_date),
      );
    });

    onlyLogisticDurationList = sort(onlyLogisticDurationList, compareNatural);
    // logistic duration: lower duration means higher grant
    const min_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, QUANTILE_min),
    ); //min
    const Q1_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, QUANTILE_25th),
    );
    const Q2_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, QUANTILE_50th),
    );
    const Q3_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, QUANTILE_75th),
    );
    const max_logistic_duration = Number(
      quantileSeq(onlyLogisticDurationList, QUANTILE_max),
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

    if (
      !logisticDurationQGrant ||
      !confirmDurationQGrant ||
      !payDurationQGrant ||
      !payAmountQGrant
    ) {
      throw new ServerError('Something is not right!');
    }
    return {
      needConfirmDuration: {
        confirmDurationQGrant,
        confirmDuration: round(confirmDuration, 2),
        min_confirm_duration: round(min_confirm_duration, 2),
        Q1_confirm_duration: round(Q1_confirm_duration, 2),
        Q2_confirm_duration: round(Q2_confirm_duration, 2),
        Q3_confirm_duration: round(Q3_confirm_duration, 2),
        max_confirm_duration: round(max_confirm_duration, 2),
      },
      needPaymentDuration: {
        payDurationQGrant,
        paymentDuration: round(paymentDuration, 2),
        min_payment_duration: round(min_payment_duration, 2),
        Q1_payment_duration: round(Q1_payment_duration, 2),
        Q2_payment_duration: round(Q2_payment_duration, 2),
        Q3_payment_duration: round(Q3_payment_duration, 2),
        max_payment_duration: round(max_payment_duration, 2),
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
      needLogisticDuration: {
        logisticDurationQGrant,
        logisticDuration: round(logisticDuration, 2),
        min_logistic_duration: round(min_logistic_duration, 2),
        Q1_logistic_duration: round(Q1_logistic_duration, 2),
        Q2_logistic_duration: round(Q2_logistic_duration, 2),
        Q3_logistic_duration: round(Q3_logistic_duration, 2),
        max_logistic_duration: round(max_logistic_duration, 2),
      },
      difficultyRatio: round(
        mean([
          logisticDurationQGrant,
          confirmDurationQGrant,
          payDurationQGrant,
          payAmountQGrant,
        ]),
        2,
      ),
      contributionRatio,
    };
  }

  @Get(`distanceRatio`)
  @ApiOperation({
    description: 'Get virtual family member"s distance ratio',
  })
  async getFamilyDistanceRatio(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];

    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const userAsFather = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.FATHER,
      Number(dappFlaskUserId),
    );
    const userAsMother = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.MOTHER,
      Number(dappFlaskUserId),
    );
    const userAsAmoo = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.AMOO,
      Number(dappFlaskUserId),
    );
    const userAsKhaleh = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.KHALEH,
      Number(dappFlaskUserId),
    );
    const userAsDaei = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.DAEI,
      Number(dappFlaskUserId),
    );
    const userAsAmme = await this.familyService.getDoneNeedsByFamilyRole(
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
    const childrenList: {
      childId: any;
      caredFor: boolean;
      status: number;
      userRole: number;
    }[] = [];
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

    // this is updated by the schedule module
    const ecoCompletePayQuartile = config().dataCache.theQuartile();

    const distanceRatio: {
      allChildrenCaredFor: boolean;
      fatherQGrant: number;
      motherQGrant: number;
      amooQGrant: number;
      khalehQGrant: number;
      daeiQGrant: number;
      ammeQGrant: number;
      avg: number;
    } = findQuartileGrant(
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
      distanceRatio: distanceRatio,
      // be ware that some needs counted more than once (e.g more than 1 participants, amoo, Khaleh paid)
      paid: {
        fatherCompletePay: userAsFather[1],
        motherCompletePay: userAsMother[1],
        amooCompletePay: userAsAmoo[1],
        daeiCompletePay: userAsDaei[1],
        khalehCompletePay: userAsKhaleh[1],
        ammeCompletePay: userAsAmme[1],
      },
    };
  }

  @Get(`credit/:flaskUserId`)
  @ApiOperation({ description: 'Get all contributors' })
  async getFamilyCredit(
    @Param('flaskUserId') flaskUserId: number,
    @Req() req: Request,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not authorized');
    }

    const credit = await this.paymentService.getFamilyCredit(flaskUserId);
    return credit;
  }

  @Get(`campaigns/statuses`)
  @ApiOperation({ description: 'Get all contributors' })
  async getEmailStatus(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    } else {
      throw new ForbiddenException('We need the user ID!');
    }
    let nestFamilyMember = await this.userService.getFamilyByFlaskId(
      dappFlaskUserId,
    );
    if (!nestFamilyMember) {
      nestFamilyMember = await this.userService.createFamily(dappFlaskUserId);
    }
    return {
      monthlyStatus: nestFamilyMember.monthlyCampaign,
      newsLetterStatus: nestFamilyMember.newsLetterCampaign,
    };
  }

  @Patch(`campaigns/monthly/status`)
  @ApiOperation({ description: 'Update monthly campaign status' })
  async updateMonthlyCampaign(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    } else {
      throw new ForbiddenException('We need the user ID!');
    }
    let nestFamilyMember = await this.userService.getFamilyByFlaskId(
      dappFlaskUserId,
    );
    if (!nestFamilyMember) {
      nestFamilyMember = await this.userService.createFamily(dappFlaskUserId);
    }
    await this.familyService.updateMonthlyCampaign(nestFamilyMember);
    return (await this.userService.getFamilyByFlaskId(dappFlaskUserId))
      .monthlyCampaign;
  }

  @Patch(`campaign/newsletter/status`)
  @ApiOperation({ description: 'Update newsletter campaign status' })
  async updateNewsLetterCampaign(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    } else {
      throw new ForbiddenException('We need the user ID!');
    }
    let nestFamilyMember = await this.userService.getFamilyByFlaskId(
      dappFlaskUserId,
    );
    if (!nestFamilyMember) {
      nestFamilyMember = await this.userService.createFamily(dappFlaskUserId);
    }
    await this.familyService.updateNewsLetterCampaign(nestFamilyMember);
    return (await this.userService.getFamilyByFlaskId(dappFlaskUserId))
      .newsLetterCampaign;
  }

  @Get('builders')
  @ApiOperation({
    description: 'Admin change the builder status of family members',
  })
  async fetchBuilders(): Promise<any> {
    return await this.familyService.fetchBuilders();
  }
}
