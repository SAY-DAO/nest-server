import { Controller, Get, Param } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Analytic')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
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
    return;
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
    const userAsFather = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.FATHER,
      Number(userId),
    );
    const userAsMother = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.MOTHER,
      Number(userId),
    );
    const userAsAmoo = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMOO,
      Number(userId),
    );
    const userAsKhaleh = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.KHALEH,
      Number(userId),
    );
    const userAsDaei = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.DAEI,
      Number(userId),
    );
    const userAsAmme = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMME,
      Number(userId),
    );

    const ecoCompletePayMedian = config().dataCache.theMedian();
    const ecoCompletePayAsRole = config().dataCache.fetchFamilyAll();
    const rolesCount = config().dataCache.fetchFamilyCount();

    const myChildren = await this.childrenService.getMyChildren(userId);
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
        userId,
        child.id,
      );

      childrenStatus = {
        childId: child.id,
        caredFor: caredFor,
        status: child.existence_status,
        userRole: child.family.members.find((m) => m.id_user === Number(userId))
          .flaskFamilyRole,
      };
      childrenList.push(childrenStatus);
    }
    console.log(childrenList);

    const calculatedResult = findQuertileBonus(
      {
        fatherCompletePay: userAsFather[1],
        motherCompletePay: userAsMother[1],
        amooCompletePay: userAsAmoo[1],
        khalehCompletePay: userAsKhaleh[1],
        daeiCompletePay: userAsDaei[1],
        ammeCompletePay: userAsAmme[1],
      },
      childrenList,
      ecoCompletePayMedian.IQRObject,
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
        distanceRatio: calculatedResult,
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
        ecoCompletePayMedian,
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
