import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  FlaskUserTypesEnum,
  NeedTypeEnum,
  SAYPlatformRoles,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { AnalyticService } from './analytic.service';
import config from 'src/config';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('Analytic')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('analytic')
export class AnalyticController {
  constructor(
    private userService: UserService,

    private readonly analyticService: AnalyticService,
  ) {}

  @Get('ecosystem/children')
  @ApiOperation({ description: 'get SAY children ecosystem analytics' })
  async getChildrenEcosystemAnalytic(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    let result: {
      meanNeedsPerChild: number;
      meanConfirmedPerChild: number;
      meanUnConfirmedPerChild: number;
      meanConfirmedNotPaidPerChild: number;
      meanCompletePayPerChild: number;
      meanPartialPayPerChild: number;
      meanPurchasedPerChild: number;
      meanMoneyToNgoPerChild: number;
      meanDeliveredNgoPerChild: number;
      meanDeliveredChildPerChild: number;
      totalFamiliesCount: number;
      totalFamilyMembersCount: number;
      meanFamilyMembers: number;
      childrenList: any;
    };
    result = config().dataCache.fetchChildrenEcosystem();
    if (!result) {
      result = await this.analyticService.getChildrenEcosystemAnalytic();
      config().dataCache.storeChildrenEcosystem({
        meanNeedsPerChild: result.meanNeedsPerChild,
        meanConfirmedPerChild: result.meanConfirmedPerChild,
        meanUnConfirmedPerChild: result.meanUnConfirmedPerChild,
        meanConfirmedNotPaidPerChild: result.meanConfirmedNotPaidPerChild,
        meanCompletePayPerChild: result.meanCompletePayPerChild,
        meanPartialPayPerChild: result.meanPartialPayPerChild,
        meanPurchasedPerChild: result.meanPurchasedPerChild,
        meanMoneyToNgoPerChild: result.meanMoneyToNgoPerChild,
        meanDeliveredNgoPerChild: result.meanDeliveredNgoPerChild,
        meanDeliveredChildPerChild: result.meanDeliveredChildPerChild,
        totalFamilies: result.totalFamiliesCount,
        totalFamilyMembers: result.totalFamilyMembersCount,
        meanFamilyMembers: result.meanFamilyMembers,
        childrenList: result.childrenList,
      });
    }

    return result;
  }

  @Get(`needs/delivered/:needType`)
  @ApiOperation({ description: 'Get all delivered needs from flask' })
  async getNeedsAnalytic(
    @Req() req: Request,
    @Param('typeId') needType: NeedTypeEnum,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.analyticService.getDeliveredNeedsAnalytic(needType);
  }

  @Get(`children`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getChildrenAnalytic(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.analyticService.getChildrenAnalytic();
  }

  @Get(`ngos`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNgoAnalytic(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.analyticService.getNgoAnalytic();
  }

  @Get(`child/needs/:childId`)
  @ApiOperation({
    description:
      'Get child needs count (confirmed,unConfirmed, confirmedNotPaid,...) from flask',
  })
  async getChildNeedsAnalytic(
    @Req() req: Request,
    @Param('childId') childId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.analyticService.getChildNeedsAnalytic(childId);
  }

  @Get(`child/active/family`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getChildFamilyAnalytic(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    let activesList = config().dataCache.fetchActiveFamilies();
    if (!activesList) {
      activesList = await this.analyticService.getChildFamilyAnalytic();
      config().dataCache.storeActiveFamilies(activesList);
    }
    return activesList;
  }

  @Get(`family/roles/scattered`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyMemberAnalyticCache(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return {
      scattered: config().dataCache.roleScatteredData(),
    };
  }

  @Get('contributions')
  @ApiOperation({ description: 'Users contributions in month' })
  async getUserContribution(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const role = convertFlaskToSayRoles(Number(panelFlaskTypeId));
    let swIds: number[];
    if (role === SAYPlatformRoles.AUDITOR) {
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (role === SAYPlatformRoles.NGO_SUPERVISOR) {
      const supervisor = await this.userService.getFlaskSocialWorker(
        panelFlaskUserId,
      );
      swIds = await this.userService
        .getFlaskSocialWorkerByNgo(supervisor.ngo_id)
        .then((r) => r.map((s) => s.id));
    }
    if (role === SAYPlatformRoles.PURCHASER) {
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    return await this.analyticService.getUserContribution(
      swIds,
      role,
      panelFlaskUserId,
    );
  }
}
