import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedTypeEnum } from 'src/types/interfaces/interface';
import { AnalyticService } from './analytic.service';

@ApiTags('Analytic')
@Controller('analytic')
export class AnalyticController {
  constructor(
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
}
