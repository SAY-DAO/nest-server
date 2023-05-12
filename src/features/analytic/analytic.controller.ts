import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedTypeEnum, SAYPlatformRoles } from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { AnalyticService } from './analytic.service';

@ApiTags('Analytic')
@Controller('analytic')
export class AnalyticController {
  constructor(
    private userService: UserService,
    private readonly analyticService: AnalyticService,
  ) { }
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

  @Get('ecosystem')
  @ApiOperation({ description: 'get SAY ecosystem analytics' })
  async getEcosystemAnalytic() {
    return await this.analyticService.getEcosystemAnalytic();
  }

  @Get('contributions/:flaskUserId/:userType')
  @ApiOperation({ description: 'Users contributions in month' })
  async getUserContribution(
    @Param('flaskUserId') flaskUserId: number,
    @Param('userType') userType: number
  ) {
    const role = convertFlaskToSayRoles(Number(userType))
    let swIds: number[]
    if (role === SAYPlatformRoles.AUDITOR) {
      swIds = await this.userService.getFlaskSwIds().then(r => r.map(s => s.id))
    }
    if (role === SAYPlatformRoles.NGO_SUPERVISOR) {
      const supervisor = await this.userService.getFlaskSocialWorker(flaskUserId)
      swIds = await this.userService.getFlaskSocialWorkerByNgo(supervisor.ngo_id).then(r => r.map(s => s.id))

    }
    if (role === SAYPlatformRoles.PURCHASER) {
      swIds = await this.userService.getFlaskSwIds().then(r => r.map(s => s.id))
    }
    console.log(swIds)
    console.log(role)

    return await this.analyticService.getUserContribution(swIds, role, flaskUserId)
  }
}
