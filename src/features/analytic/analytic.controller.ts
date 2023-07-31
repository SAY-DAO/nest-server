import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  NeedTypeEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import {
  calculateUserAsRolePayments,
  convertFlaskToSayRoles,
} from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { AnalyticService } from './analytic.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import config from 'src/config';

@ApiTags('Analytic')
@Controller('analytic')
export class AnalyticController {
  constructor(
    private userService: UserService,
    private needService: NeedService,
    private childrenService: ChildrenService,
    private readonly analyticService: AnalyticService,
  ) {}

  @Get('ecosystem')
  @ApiOperation({ description: 'get SAY ecosystem analytics' })
  async getEcosystemAnalytic() {
    return await this.analyticService.getEcosystemAnalytic();
  }

  @Get(`needs/:typeId`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeedsAnalytic(@Param('typeId') typeId: NeedTypeEnum) {
    return await this.analyticService.getNeedsAnalytic(typeId);
  }

  @Get(`children`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getChildrenAnalytic() {
    return await this.analyticService.getChildrenAnalytic();
  }

  @Get(`ngos`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNgoAnalytic() {
    return await this.analyticService.getNgoAnalytic();
  }

  @Get(`child/needs/:childId`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getChildNeedsAnalytic(@Param('childId') childId: number) {
    return await this.analyticService.getChildNeedsAnalytic(childId);
  }

  @Get(`child/family/:childId`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getChildFamilyAnalytic(@Param('childId') childId: number) {
    return await this.analyticService.getChildFamilyAnalytic(childId);
  }

  @Get(`family/:userId`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyMemberAnalytic(@Param('userId') userId: number) {
    const userAsFather = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.FATHER,
      Number(userId),
    );
    const userAsMother = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.MOTHER,
      Number(userId),
    );
    const userAsAmoo = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMOO,
      Number(userId),
    );
    const userAsKhaleh = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.KHALEH,
      Number(userId),
    );
    const userAsDaei = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.DAEI,
      Number(userId),
    );
    const userAsAmme = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMME,
      Number(userId),
    );

    const fathersFinal = calculateUserAsRolePayments(
      userAsFather,
      VirtualFamilyRole.FATHER,
      Number(userId),
    );
    const mothersFinal = calculateUserAsRolePayments(
      userAsMother,
      VirtualFamilyRole.MOTHER,
      Number(userId),
    );
    const amoosFinal = calculateUserAsRolePayments(
      userAsAmoo,
      VirtualFamilyRole.AMOO,
      Number(userId),
    );
    const daeisFinal = calculateUserAsRolePayments(
      userAsDaei,
      VirtualFamilyRole.DAEI,
      Number(userId),
    );
    const khalehsFinal = calculateUserAsRolePayments(
      userAsKhaleh,
      VirtualFamilyRole.KHALEH,
      Number(userId),
    );
    const ammesFinal = calculateUserAsRolePayments(
      userAsAmme,
      VirtualFamilyRole.AMME,
      Number(userId),
    );

    console.log('---- counters ----');
    console.log('# of Delivered needs as father: ' + userAsFather[1]);
    console.log('# of Delivered needs as mother: ' + userAsMother[1]);
    console.log('# of Delivered needs as amoo: ' + userAsAmoo[1]);
    console.log('# of Delivered needs as khaleh: ' + userAsKhaleh[1]);
    console.log('# of Delivered needs as daei: ' + userAsDaei[1]);
    console.log('# of Delivered needs as amme: ' + userAsAmme[1]);

    console.log('---- counters ----');
    console.log('father avg delvery days: ' + fathersFinal.roleAvg);
    console.log('mother avg delvery days: ' + mothersFinal.roleAvg);
    console.log('amoo avg delvery days: ' + amoosFinal.roleAvg);
    console.log('khaleh avg delvery days: ' + daeisFinal.roleAvg);
    console.log('daei avg delvery days: ' + khalehsFinal.roleAvg);
    console.log('amme avg delvery days: ' + ammesFinal.roleAvg);

    return {
      userAsFatherRate:
        fathersFinal.roleAvg / config().dataCache.fetchFamilyAll().fathersAvg,
      userAsMotherRate:
        mothersFinal.roleAvg / config().dataCache.fetchFamilyAll().mothersAvg,
      userAsAmooRate:
        amoosFinal.roleAvg / config().dataCache.fetchFamilyAll().ammesAvg,
      userAsDaeiRate:
        daeisFinal.roleAvg / config().dataCache.fetchFamilyAll().khalehsAvg,
      userAsKhalehRate:
        khalehsFinal.roleAvg / config().dataCache.fetchFamilyAll().daeisAvg,
      userAsAmmeRate:
        ammesFinal.roleAvg / config().dataCache.fetchFamilyAll().ammesAvg,
      userDistanceAvg: {
        fathersFinal: fathersFinal.roleAvg,
        mothersFinal: mothersFinal.roleAvg,
        amoosFinal: amoosFinal.roleAvg,
        daeisFinal: daeisFinal.roleAvg,
        khalehsFinal: khalehsFinal.roleAvg,
        ammesFinal: ammesFinal.roleAvg,
      },
      ecosystemDistanceAvg: config().dataCache.fetchFamilyAll(),
      // paidNeed: father[0][0],
      // minedCount: amooFinal,
      // difficultyRatio: 0,
      // distanceRatio: 0,
      // needRatio: 0,
    };
  }

  @Get(`family/roles/all`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyMemberAnalyticCache() {
    return config().dataCache.fetchFamilyAll();
  }

  @Get('contributions/:flaskUserId/:userType')
  @ApiOperation({ description: 'Users contributions in month' })
  async getUserContribution(
    @Param('flaskUserId') flaskUserId: number,
    @Param('userType') userType: number,
  ) {
    const role = convertFlaskToSayRoles(Number(userType));
    let swIds: number[];
    if (role === SAYPlatformRoles.AUDITOR) {
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (role === SAYPlatformRoles.NGO_SUPERVISOR) {
      const supervisor = await this.userService.getFlaskSocialWorker(
        flaskUserId,
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
      flaskUserId,
    );
  }
}
