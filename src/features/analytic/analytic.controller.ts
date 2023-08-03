import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  NeedTypeEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles, findQuertileBonus } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { AnalyticService } from './analytic.service';
import { ChildrenService } from '../children/children.service';
import config from 'src/config';
import { FamilyService } from '../family/family.service';
import { max, round } from 'mathjs';

@ApiTags('Analytic')
@Controller('analytic')
export class AnalyticController {
  constructor(
    private userService: UserService,
    private familyService: FamilyService,
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
    const myChildren = await this.childrenService.getMyChildren(userId);
    let allMyChildrenHasPayments = false;
    for await (const child of myChildren) {
      if (child.id === 118) {
        continue;
      }
      const childPayments = await this.familyService.countMyChildPayments(
        userId,
        child.id,
      );

      if (childPayments) {
        allMyChildrenHasPayments = true;
        continue;
      } else {
        allMyChildrenHasPayments = false;
        break;
      }
    }
    const userAsFather = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.FATHER,
      Number(userId),
    );
    const userAsMother = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.MOTHER,
      Number(userId),
    );
    const userAsAmoo = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMOO,
      Number(userId),
    );
    const userAsKhaleh = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.KHALEH,
      Number(userId),
    );
    const userAsDaei = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.DAEI,
      Number(userId),
    );
    const userAsAmme = await this.familyService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMME,
      Number(userId),
    );

    const ecoDeliveredMedian = config().dataCache.theMedian();
    const ecoDeliveredAsRole = config().dataCache.fetchFamilyAll();
    const rolesCount = config().dataCache.fetchFamilyCount();

    const calculatedResult = findQuertileBonus(
      {
        fatherDelivered: userAsFather[1],
        motherDelivered: userAsMother[1],
        amooDelivered: userAsAmoo[1],
        khalehDelivered: userAsKhaleh[1],
        daeiDelivered: userAsDaei[1],
        ammeDelivered: userAsAmme[1],
      },
      ecoDeliveredMedian.IQRObject,
    );

    const fatherQuerter =
      userAsFather[1] / ecoDeliveredMedian.IQRObject.Q2.father;
    const motherQuerter =
      userAsMother[1] / ecoDeliveredMedian.IQRObject.Q2.mother;
    const amooQuerter = userAsAmoo[1] / ecoDeliveredMedian.IQRObject.Q2.amoo;
    const daeiQuerter =
      userAsKhaleh[1] / ecoDeliveredMedian.IQRObject.Q2.khaleh;
    const khalehQuerter = userAsDaei[1] / ecoDeliveredMedian.IQRObject.Q2.daei;
    const ammeQuerter = userAsAmme[1] / ecoDeliveredMedian.IQRObject.Q2.amme;

    return {
      calculatedResult,
      // calculatedResult: allMyChildrenHasPayments
      //   ? round(
      //       max(
      //         fatherQuerter,
      //         motherQuerter,
      //         amooQuerter,
      //         daeiQuerter,
      //         khalehQuerter,
      //         ammeQuerter,
      //       ),
      //     )
      //   : 0,
      // be ware that some needs counted more than once (e.g more than 1 participants, amoo, Khaleh paid)
      theUser: {
        allMyChildrenHasPayments,
        fatherDelivered: userAsFather[1],
        motherDelivered: userAsMother[1],
        amooDelivered: userAsAmoo[1],
        daeiDelivered: userAsKhaleh[1],
        khalehDelivered: userAsDaei[1],
        ammeDelivered: userAsAmme[1],
        fatherQuerter,
        motherQuerter,
        amooQuerter,
        daeiQuerter,
        khalehQuerter,
        ammeQuerter,
      },
      ecosystem: {
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
        fathersDelivered: ecoDeliveredAsRole.fathersData.length,
        mothersDelivered: ecoDeliveredAsRole.mothersData.length,
        amoosDelivered: ecoDeliveredAsRole.amoosData.length,
        khalehsDelivered: ecoDeliveredAsRole.khalehsData.length,
        daeisDelivered: ecoDeliveredAsRole.daeisData.length,
        ammesDelivered: ecoDeliveredAsRole.ammesData.length,
        totalDelivered:
          ecoDeliveredAsRole.fathersData.length +
          ecoDeliveredAsRole.mothersData.length +
          ecoDeliveredAsRole.amoosData.length +
          ecoDeliveredAsRole.khalehsData.length +
          ecoDeliveredAsRole.daeisData.length +
          ecoDeliveredAsRole.ammesData.length,
        ecoDeliveredMedian,
      },
      // paidNeed: father[0][0],
      // minedCount: amooFinal,
      // difficultyRatio: 0,
      // distanceRatio: 0,
      // needRatio: 0,
    };
  }

  @Get(`family/roles/scattered`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyMemberAnalyticCache() {
    return {
      scattered: config().dataCache.roleScatteredData(),
    };
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
