import { Controller, Get, Param, Req } from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { SAY_DAPP_ID, VirtualFamilyRole } from 'src/types/interfaces/interface';
import config from 'src/config';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { findQuartileGrant } from 'src/utils/helpers';

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
  ) {}

  @Get(`say/payments`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getSayPayments() {
    return await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.SAY,
      Number(SAY_DAPP_ID),
    );
  }

  @Get(`roles/ecosystem/payments`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyRolesCompletePays() {
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

  @Get(`distanceRatio`)
  @ApiOperation({
    description: 'Get virtual family member"s distance ratio',
  })
  async getFamilyDistanceRatio(@Req() req: Request) {
    const flaskUserId = req.headers['appFlaskUserId'];

    const userAsFather = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.FATHER,
      Number(flaskUserId),
    );
    const userAsMother = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.MOTHER,
      Number(flaskUserId),
    );
    const userAsAmoo = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMOO,
      Number(flaskUserId),
    );
    const userAsKhaleh = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.KHALEH,
      Number(flaskUserId),
    );
    const userAsDaei = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.DAEI,
      Number(flaskUserId),
    );
    const userAsAmme = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMME,
      Number(flaskUserId),
    );

    const myChildren = await this.childrenService.getMyChildren(flaskUserId);
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
        flaskUserId,
        child.id,
      );

      childrenStatus = {
        childId: child.id,
        caredFor: caredFor,
        status: child.existence_status,
        userRole: child.family.members.find(
          (m) => m.id_user === Number(flaskUserId),
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

  @Get(`signatures/ready`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyNeeds(@Req() req: Request) {
    const flaskUserId = req.headers['appFlaskUserId'];
    if (!flaskUserId) {
      throw new ObjectNotFound('We need the user ID!');
    }
    const payments = await this.familyService.getFamilyReadyToSignNeeds(
      Number(flaskUserId),
    );

    return payments.filter((p) => p.need.midjourneyImage !== null);
  }

  @Get(`signature/ready/:needId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyOneNeed(@Req() req: Request, @Param('needId') needId: string) {
    const flaskUserId = req.headers['appFlaskUserId'];

    if (!needId) {
      throw new ObjectNotFound('We need the needId!');
    }
    const theNeed = await this.familyService.getFamilyReadyToSignOneNeed(
      needId,
    );

    const members = await this.familyService.getChildFamilyMembers(
      theNeed.child.flaskId,
    );

    if (!theNeed.verifiedPayments.find((p) => p.flaskUserId === flaskUserId)) {
      throw new ObjectNotFound('This is not your need!');
    }
    return {
      ...theNeed,
      members,
    };
  }
}
