import { Controller, Get, Param } from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { SAY_DAPP_ID, VirtualFamilyRole } from 'src/types/interfaces/interface';
import config from 'src/config';
import { findQuertileBonus } from 'src/utils/helpers';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { WalletService } from '../wallet/wallet.service';

@ApiTags('Family')
// @ApiSecurity('flask-access-token')
// @ApiHeader({
//   name: 'flaskId',
//   description: 'to use cache and flask authentication',
//   required: true,
// })
@Controller('family')
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private walletService: WalletService,
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

  @Get(`payments/:userId`)
  @ApiOperation({ description: 'Get all family role analysis for a user' })
  async getFamilyMemberCompletePays(@Param('userId') userId: number) {
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
    console.log(ecoCompletePayMedian.IQRObject);

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

        ecoCompletePayMedian,
      },
    };
  }

  @Get(`signatures/ready/:flaskUserId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyNeeds(@Param('flaskUserId') flaskUserId: number) {
    if (!flaskUserId) {
      throw new ObjectNotFound('We need the user ID!');
    }
    return await this.familyService.getFamilyReadyToSignNeeds(Number(flaskUserId));
  }

  @Get(`signature/ready/:needId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyOneNeed(@Param('needId') needId: string) {
    if (!needId) {
      throw new ObjectNotFound('We need the needId!');
    }
    return await this.familyService.getFamilyReadyToSignOneNeed(needId);
  }
}
